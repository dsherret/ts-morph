import { errors } from "../errors";
import { StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";
import { ts } from "../typescript";
import { createCompilerSourceFile } from "./createCompilerSourceFile";

/**
 * An implementation of a ts.DocumentRegistry that uses a transactional file system.
 */
export class DocumentRegistry implements ts.DocumentRegistry {
  readonly #sourceFileCacheByFilePath = new Map<StandardizedFilePath, ts.SourceFile>();
  readonly #transactionalFileSystem: TransactionalFileSystem;
  static readonly #initialVersion = "0";

  /**
   * Constructor.
   * @param transactionalFileSystem - The transaction file system to use.
   */
  constructor(transactionalFileSystem: TransactionalFileSystem) {
    this.#transactionalFileSystem = transactionalFileSystem;
  }

  /**
   * Creates or updates a source file in the document registry.
   * @param fileName - File name to create or update.
   * @param compilationSettings - Compiler options to use.
   * @param scriptSnapshot - Script snapshot (text) of the file.
   * @param scriptKind - Script kind of the file.
   */
  createOrUpdateSourceFile(
    fileName: StandardizedFilePath,
    compilationSettings: ts.CompilerOptions,
    scriptSnapshot: ts.IScriptSnapshot,
    scriptKind: ts.ScriptKind | undefined,
  ) {
    let sourceFile = this.#sourceFileCacheByFilePath.get(fileName);
    if (sourceFile == null)
      sourceFile = this.#updateSourceFile(fileName, compilationSettings, scriptSnapshot, DocumentRegistry.#initialVersion, scriptKind);
    else
      sourceFile = this.#updateSourceFile(fileName, compilationSettings, scriptSnapshot, this.#getNextSourceFileVersion(sourceFile), scriptKind);
    return sourceFile;
  }

  /**
   * Removes the source file from the document registry.
   * @param fileName - File name to remove.
   */
  removeSourceFile(fileName: StandardizedFilePath) {
    this.#sourceFileCacheByFilePath.delete(fileName);
  }

  /** @inheritdoc */
  acquireDocument(
    fileName: string,
    compilationSettings: ts.CompilerOptions,
    scriptSnapshot: ts.IScriptSnapshot,
    version: string,
    scriptKind: ts.ScriptKind | undefined,
  ): ts.SourceFile {
    const standardizedFilePath = this.#transactionalFileSystem.getStandardizedAbsolutePath(fileName);
    let sourceFile = this.#sourceFileCacheByFilePath.get(standardizedFilePath);
    if (sourceFile == null || this.getSourceFileVersion(sourceFile) !== version)
      sourceFile = this.#updateSourceFile(standardizedFilePath, compilationSettings, scriptSnapshot, version, scriptKind);
    return sourceFile;
  }

  /** @inheritdoc */
  acquireDocumentWithKey(
    fileName: string,
    path: ts.Path,
    compilationSettings: ts.CompilerOptions,
    key: ts.DocumentRegistryBucketKey,
    scriptSnapshot: ts.IScriptSnapshot,
    version: string,
    scriptKind: ts.ScriptKind | undefined,
  ): ts.SourceFile {
    // ignore the key because we only ever keep track of one key
    return this.acquireDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
  }

  /** @inheritdoc */
  updateDocument(
    fileName: string,
    compilationSettings: ts.CompilerOptions,
    scriptSnapshot: ts.IScriptSnapshot,
    version: string,
    scriptKind: ts.ScriptKind | undefined,
  ): ts.SourceFile {
    // the compiler will call this even when it doesn't need to update for some reason
    return this.acquireDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
  }

  /** @inheritdoc */
  updateDocumentWithKey(
    fileName: string,
    path: ts.Path,
    compilationSettings: ts.CompilerOptions,
    key: ts.DocumentRegistryBucketKey,
    scriptSnapshot: ts.IScriptSnapshot,
    version: string,
    scriptKind: ts.ScriptKind | undefined,
  ): ts.SourceFile {
    // ignore the key because we only ever keep track of one key
    return this.updateDocument(fileName, compilationSettings, scriptSnapshot, version, scriptKind);
  }

  /** @inheritdoc */
  getKeyForCompilationSettings(settings: ts.CompilerOptions): ts.DocumentRegistryBucketKey {
    return "defaultKey" as ts.DocumentRegistryBucketKey;
  }

  /** @inheritdoc */
  releaseDocument(fileName: string, compilationSettings: ts.CompilerOptions) {
  }

  /** @inheritdoc */
  releaseDocumentWithKey(path: ts.Path, key: ts.DocumentRegistryBucketKey) {
  }

  /** @inheritdoc */
  reportStats(): string {
    throw new errors.NotImplementedError();
  }

  /** @inheritdoc */
  getSourceFileVersion(sourceFile: ts.SourceFile): string {
    return (sourceFile as any).version || "0";
  }

  #getNextSourceFileVersion(sourceFile: ts.SourceFile) {
    const currentVersion = parseInt(this.getSourceFileVersion(sourceFile), 10) || 0;
    return (currentVersion + 1).toString();
  }

  #updateSourceFile(
    fileName: StandardizedFilePath,
    compilationSettings: ts.CompilerOptions,
    scriptSnapshot: ts.IScriptSnapshot,
    version: string,
    scriptKind: ts.ScriptKind | undefined,
  ): ts.SourceFile {
    const newSourceFile = createCompilerSourceFile(fileName, scriptSnapshot, compilationSettings.target, version, true, scriptKind);
    this.#sourceFileCacheByFilePath.set(fileName, newSourceFile);
    return newSourceFile;
  }
}
