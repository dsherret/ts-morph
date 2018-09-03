/* barrel:ignore */
import { ts, CompilerOptions, ScriptKind, ScriptTarget } from "../typescript";
import { KeyValueCache } from "../utils";
import { FileSystemWrapper } from "../fileSystem";
import * as errors from "../errors";

export class DocumentRegistry implements ts.DocumentRegistry {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, ts.SourceFile>();
    private static readonly initialVersion = "0";

    constructor(private readonly fileSystemWrapper: FileSystemWrapper) {
    }

    removeSourceFile(fileName: string) {
        this.sourceFileCacheByFilePath.removeByKey(fileName);
    }

    createOrUpdateSourceFile(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: ts.IScriptSnapshot) {
        let sourceFile = this.sourceFileCacheByFilePath.get(fileName);
        if (sourceFile == null)
            sourceFile = this.updateSourceFile(fileName, compilationSettings, scriptSnapshot, DocumentRegistry.initialVersion);
        else
            sourceFile = this.updateSourceFile(fileName, compilationSettings, scriptSnapshot, this.getNextSourceFileVersion(sourceFile));
        return sourceFile;
    }

    acquireDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, version: string, scriptKind?: ScriptKind | undefined): ts.SourceFile {
        let sourceFile = this.sourceFileCacheByFilePath.get(fileName);
        if (sourceFile == null || this.getSourceFileVersion(sourceFile) !== version)
            sourceFile = this.updateSourceFile(fileName, compilationSettings, scriptSnapshot, version);
        return sourceFile;
    }

    acquireDocumentWithKey(fileName: string, path: ts.Path, compilationSettings: CompilerOptions, key: ts.DocumentRegistryBucketKey, scriptSnapshot: ts.IScriptSnapshot,
        version: string, scriptKind?: ScriptKind | undefined): ts.SourceFile
    {
        // ignore the key because we only ever keep track of one key
        return this.acquireDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
    }

    updateDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, version: string,
        scriptKind?: ScriptKind | undefined): ts.SourceFile
    {
        // the compiler will call this even when it doesn't need to update for some reason
        return this.acquireDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
    }

    updateDocumentWithKey(fileName: string, path: ts.Path, compilationSettings: CompilerOptions, key: ts.DocumentRegistryBucketKey, scriptSnapshot: ts.IScriptSnapshot,
        version: string, scriptKind?: ScriptKind | undefined): ts.SourceFile
    {
        // ignore the key because we only ever keep track of one key
        return this.updateDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
    }

    getKeyForCompilationSettings(settings: CompilerOptions): ts.DocumentRegistryBucketKey {
        return "defaultKey" as ts.DocumentRegistryBucketKey;
    }

    releaseDocument(fileName: string, compilationSettings: CompilerOptions) {
        // ignore, handled by removeSourceFile
    }

    releaseDocumentWithKey(path: ts.Path, key: ts.DocumentRegistryBucketKey) {
        // ignore, handled by removeSourceFile
    }

    reportStats(): string {
        throw new errors.NotImplementedError();
    }

    getSourceFileVersion(sourceFile: ts.SourceFile) {
        return (sourceFile as any).version || "0";
    }

    private getNextSourceFileVersion(sourceFile: ts.SourceFile) {
        const currentVersion = parseInt(this.getSourceFileVersion(sourceFile), 10) || 0;
        return (currentVersion + 1).toString();
    }

    private updateSourceFile(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, version: string): ts.SourceFile {
        fileName = this.fileSystemWrapper.getStandardizedAbsolutePath(fileName);
        const newSourceFile = this.createCompilerSourceFile(fileName, scriptSnapshot, compilationSettings, version);
        this.sourceFileCacheByFilePath.set(fileName, newSourceFile);
        return newSourceFile;
    }

    private createCompilerSourceFile(fileName: string, scriptSnapshot: ts.IScriptSnapshot, compilationSettings: CompilerOptions, version: string) {
        const scriptTarget = compilationSettings.target || ScriptTarget.Latest;
        return ts.createLanguageServiceSourceFile(fileName, scriptSnapshot, scriptTarget, version, true, /* scriptKind */ undefined);
    }
}
