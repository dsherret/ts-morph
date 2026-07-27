import {
  CompilerOptionsContainer,
  createFileSystemAdapter,
  DocumentRegistry,
  FileUtils,
  libFolderInMemoryPath,
  type ResolutionHost,
  StandardizedFilePath,
  StringUtils,
  toModuleNameResolver,
  TransactionalFileSystem,
  ts,
} from "@ts-morph/common";

export interface SourceFileCacheOptions {
  /** Whether to leave the default lib files out of the project. */
  skipLoadingLibFiles?: boolean;
  /** Folder the default lib files are read from. */
  libFolderPath?: string;
  /** Resolves module specifiers in place of the compiler. */
  resolutionHost?: ResolutionHost;
}

/**
 * Holds the source files the project knows about.
 *
 * Breaking change: files are stored as text rather than as an `IScriptSnapshot`,
 * and there is no per-file script kind — tsgo owns parsing and derives the script
 * kind from the file extension.
 */
export class SourceFileCache {
  readonly #sourceFilesByFilePath = new Map<StandardizedFilePath, ts.SourceFile>();
  readonly #fileSystemWrapper: TransactionalFileSystem;
  readonly #compilerOptions: CompilerOptionsContainer;
  #projectVersion = 0;

  readonly documentRegistry: DocumentRegistry;

  constructor(
    fileSystemWrapper: TransactionalFileSystem,
    compilerOptions: CompilerOptionsContainer,
    options: SourceFileCacheOptions = {},
  ) {
    this.#fileSystemWrapper = fileSystemWrapper;
    this.#compilerOptions = compilerOptions;
    // the registry owns the tsgo session: the wasm compiler, the snapshot, and
    // the project the program, the checker and every source file come from
    this.documentRegistry = new DocumentRegistry({
      compilerOptions: getRegistryCompilerOptions(compilerOptions, options),
      // so module resolution, `/// <reference>`s and typeRoots see everything the
      // project's file system holds, not only the files pushed into the registry
      fs: createFileSystemAdapter(fileSystemWrapper, { encoding: compilerOptions.getEncoding() }),
      // the lib files live on the project's file system, so the compiler is
      // pointed at them rather than at the copies bundled inside the wasm module
      libFolderPath: options.skipLoadingLibFiles ? undefined : options.libFolderPath ?? libFolderInMemoryPath,
      useCaseSensitiveFileNames: fileSystemWrapper.getFileSystem().isCaseSensitive(),
      resolveModuleName: toModuleNameResolver(options.resolutionHost),
    });

    // changing the options reopens the project, which reparses every file, so the
    // cached nodes have to be replaced with the ones the new project holds
    compilerOptions.onModified(() => {
      this.documentRegistry.setCompilerOptions(getRegistryCompilerOptions(compilerOptions, options));
      for (const [filePath] of this.#sourceFilesByFilePath) {
        const sourceFile = this.documentRegistry.getSourceFile(filePath);
        if (sourceFile != null)
          this.#sourceFilesByFilePath.set(filePath, sourceFile);
      }
      this.#projectVersion++;
    });
  }

  containsSourceFileAtPath(filePath: StandardizedFilePath) {
    return this.#sourceFilesByFilePath.has(filePath);
  }

  getSourceFilePaths() {
    return this.#sourceFilesByFilePath.keys();
  }

  getSourceFiles() {
    return this.#sourceFilesByFilePath.values();
  }

  getProjectVersion() {
    return this.#projectVersion;
  }

  getSourceFileVersion(sourceFile: ts.SourceFile) {
    return this.documentRegistry.getSourceFileVersion(sourceFile.fileName);
  }

  getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath) {
    return this.#sourceFilesByFilePath.get(filePath);
  }

  async addOrGetSourceFileFromFilePath(filePath: StandardizedFilePath): Promise<ts.SourceFile | undefined> {
    let sourceFile = this.#sourceFilesByFilePath.get(filePath);
    if (sourceFile == null) {
      const fileText = await this.#fileSystemWrapper.readFileIfExists(filePath, this.#compilerOptions.getEncoding());
      if (fileText != null)
        sourceFile = this.createSourceFileFromText(filePath, fileText);
    }

    return sourceFile;
  }

  addOrGetSourceFileFromFilePathSync(filePath: StandardizedFilePath): ts.SourceFile | undefined {
    let sourceFile = this.#sourceFilesByFilePath.get(filePath);
    if (sourceFile == null) {
      const fileText = this.#fileSystemWrapper.readFileIfExistsSync(filePath, this.#compilerOptions.getEncoding());
      if (fileText != null)
        sourceFile = this.createSourceFileFromText(filePath, fileText);
    }

    return sourceFile;
  }

  createSourceFileFromText(filePath: StandardizedFilePath, text: string): ts.SourceFile {
    filePath = this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    if (StringUtils.hasBom(text))
      text = StringUtils.stripBom(text);

    const sourceFile = this.documentRegistry.createOrUpdateSourceFile(filePath, text);

    const dirPath = FileUtils.getDirPath(filePath);
    if (!this.#fileSystemWrapper.directoryExistsSync(dirPath))
      this.#fileSystemWrapper.queueMkdir(dirPath);

    // the files the change did not touch keep the nodes they already had: the
    // registry's project carries their parsed trees across the new snapshot
    this.#sourceFilesByFilePath.set(filePath, sourceFile);
    this.#projectVersion++;
    return sourceFile;
  }

  removeSourceFile(filePath: StandardizedFilePath) {
    if (!this.#sourceFilesByFilePath.delete(filePath))
      return;
    this.documentRegistry.removeSourceFile(filePath);
    this.#projectVersion++;
  }

  containsDirectoryAtPath(dirPath: StandardizedFilePath) {
    return this.#fileSystemWrapper.directoryExistsSync(dirPath);
  }

  getChildDirectoriesOfDirectory(dirPath: StandardizedFilePath) {
    return this.#fileSystemWrapper.getDirectories(dirPath);
  }
}

/**
 * The options the registry's project is opened with.
 *
 * `skipLoadingLibFiles` used to work by leaving the lib files off the file
 * system, but tsgo carries its own copies inside the wasm module and reads those
 * unless told not to, so the option becomes `noLib`.
 */
function getRegistryCompilerOptions(compilerOptions: CompilerOptionsContainer, options: SourceFileCacheOptions): ts.CompilerOptions {
  const result = compilerOptions.get();
  if (options.skipLoadingLibFiles)
    result.noLib = true;
  return result;
}
