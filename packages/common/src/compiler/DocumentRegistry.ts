import { KeyValueCache } from "../collections";
import { errors } from "../errors";
import { TransactionalFileSystem } from "../fileSystem";
import { ts, CompilerOptions, ScriptKind } from "../typescript";
import { createCompilerSourceFile } from "./createCompilerSourceFile";
import { DocumentCache } from "./DocumentCache";

/**
 * An implementation of a ts.DocumentRegistry that uses a transactional file system and
 * supports using cached parsed source files.
 */
export class DocumentRegistry implements ts.DocumentRegistry {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, ts.SourceFile>();
    private static readonly initialVersion = "0";

    /**
     * Constructor.
     * @param transactionalFileSystem - The transaction file system to use.
     */
    constructor(private readonly transactionalFileSystem: TransactionalFileSystem, private readonly documentCaches?: DocumentCache[]) {
    }

    /**
     * Removes the source file from the document registry
     * @param fileName - File name to remove.
     */
    removeSourceFile(fileName: string) {
        this.sourceFileCacheByFilePath.removeByKey(fileName);
    }

    /**
     * Creates or updates a source file in the document registry.
     * @param fileName - File name to create or update.
     * @param compilationSettings - Compiler options to use.
     * @param scriptSnapshot - Script snapshot (text) of the file.
     * @param scriptKind - Script kind of the file.
     */
    createOrUpdateSourceFile(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, scriptKind: ScriptKind | undefined) {
        let sourceFile = this.sourceFileCacheByFilePath.get(fileName);
        if (sourceFile == null) {
            sourceFile = this.updateSourceFile(fileName, compilationSettings, scriptSnapshot, DocumentRegistry.initialVersion, scriptKind);
        }
        else
            sourceFile = this.updateSourceFile(fileName, compilationSettings, scriptSnapshot, this.getNextSourceFileVersion(sourceFile), scriptKind);
        return sourceFile;
    }

    /** @inheritdoc */
    acquireDocument(
        fileName: string,
        compilationSettings: CompilerOptions,
        scriptSnapshot: ts.IScriptSnapshot,
        version: string,
        scriptKind: ScriptKind | undefined
    ): ts.SourceFile {
        let sourceFile = this.sourceFileCacheByFilePath.get(fileName);
        if (sourceFile == null || this.getSourceFileVersion(sourceFile) !== version)
            sourceFile = this.updateSourceFile(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
        return sourceFile;
    }

    /** @inheritdoc */
    acquireDocumentWithKey(
        fileName: string,
        path: ts.Path,
        compilationSettings: CompilerOptions,
        key: ts.DocumentRegistryBucketKey,
        scriptSnapshot: ts.IScriptSnapshot,
        version: string,
        scriptKind: ScriptKind | undefined
    ): ts.SourceFile {
        // ignore the key because we only ever keep track of one key
        return this.acquireDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
    }

    /** @inheritdoc */
    updateDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, version: string,
        scriptKind: ScriptKind | undefined): ts.SourceFile
    {
        // the compiler will call this even when it doesn't need to update for some reason
        return this.acquireDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
    }

    /** @inheritdoc */
    updateDocumentWithKey(
        fileName: string,
        path: ts.Path,
        compilationSettings: CompilerOptions,
        key: ts.DocumentRegistryBucketKey,
        scriptSnapshot: ts.IScriptSnapshot,
        version: string,
        scriptKind: ScriptKind | undefined
    ): ts.SourceFile {
        // ignore the key because we only ever keep track of one key
        return this.updateDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
    }

    /** @inheritdoc */
    getKeyForCompilationSettings(settings: CompilerOptions): ts.DocumentRegistryBucketKey {
        return "defaultKey" as ts.DocumentRegistryBucketKey;
    }

    /** @inheritdoc */
    releaseDocument(fileName: string, compilationSettings: CompilerOptions) {
        // ignore, handled by removeSourceFile
    }

    /** @inheritdoc */
    releaseDocumentWithKey(path: ts.Path, key: ts.DocumentRegistryBucketKey) {
        // ignore, handled by removeSourceFile
    }

    /** @inheritdoc */
    reportStats(): string {
        throw new errors.NotImplementedError();
    }

    /** @inheritdoc */
    getSourceFileVersion(sourceFile: ts.SourceFile) {
        return (sourceFile as any).version || "0";
    }

    private getNextSourceFileVersion(sourceFile: ts.SourceFile) {
        const currentVersion = parseInt(this.getSourceFileVersion(sourceFile), 10) || 0;
        return (currentVersion + 1).toString();
    }

    private updateSourceFile(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, version: string,
        scriptKind: ScriptKind | undefined): ts.SourceFile
    {
        fileName = this.transactionalFileSystem.getStandardizedAbsolutePath(fileName);

        // see if any of the document caches have this source file
        if (this.documentCaches) {
            for (const cache of this.documentCaches) {
                const document = cache._getDocumentIfMatch(fileName, scriptSnapshot, compilationSettings.target, scriptKind);
                if (document != null) {
                    this.sourceFileCacheByFilePath.set(fileName, document);
                    return document;
                }
            }
        }

        // otherwise, create it
        const newSourceFile = createCompilerSourceFile(fileName, scriptSnapshot, compilationSettings.target, version, scriptKind);
        this.sourceFileCacheByFilePath.set(fileName, newSourceFile);
        return newSourceFile;
    }
}
