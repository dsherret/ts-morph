import {
  CompilerOptionsContainer,
  createHosts,
  createModuleResolutionHost,
  errors,
  FileSystemHost,
  FileUtils,
  InMemoryFileSystemHost,
  Memoize,
  RealFileSystemHost,
  ResolutionHostFactory,
  runtime,
  StandardizedFilePath,
  TransactionalFileSystem,
  ts,
  TsConfigResolver,
} from "@ts-morph/common";
import { SourceFileCache } from "./SourceFileCache";

/** Options for creating a project. */
export interface ProjectOptions {
  /** Compiler options */
  compilerOptions?: ts.CompilerOptions;
  /** File path to the tsconfig.json file. */
  tsConfigFilePath?: string;
  /** Whether to skip adding source files from the specified tsconfig.json. @default false */
  skipAddingFilesFromTsConfig?: boolean;
  /** Skip resolving file dependencies when providing a ts config file path and adding the files from tsconfig. @default false */
  skipFileDependencyResolution?: boolean;
  /**
   * Skip loading the lib files. Unlike the compiler API, ts-morph does not load these
   * from the node_modules folder, but instead loads them from some other JS code
   * and uses a fake path for their existence. If you want to use a custom lib files
   * folder path, then provide one using the libFolderPath options.
   * @default false
   */
  skipLoadingLibFiles?: boolean;
  /** The folder to use for loading lib files. */
  libFolderPath?: string;
  /** Whether to use an in-memory file system. */
  useInMemoryFileSystem?: boolean;
  /**
   * Optional file system host. Useful for mocking access to the file system.
   * @remarks Consider using `useInMemoryFileSystem` instead.
   */
  fileSystem?: FileSystemHost;
  /** Creates a resolution host for specifying custom module and/or type reference directive resolution. */
  resolutionHost?: ResolutionHostFactory;
  /**
   * Unstable and will probably be removed in the future.
   * I believe this option should be internal to the library and if you know how to achieve
   * that then please consider submitting a PR.
   */
  isKnownTypesPackageName?: ts.LanguageServiceHost["isKnownTypesPackageName"];
}

/**
 * Asynchronously creates a new collection of source files to analyze.
 * @param options Options for creating the project.
 */
export async function createProject(options: ProjectOptions = {}): Promise<Project> {
  const { project, tsConfigResolver } = createProjectCommon(options);

  // add any file paths from the tsconfig if necessary
  if (tsConfigResolver != null && options.skipAddingFilesFromTsConfig !== true) {
    await project._addSourceFilesForTsConfigResolver(tsConfigResolver, project.compilerOptions.get());

    if (!options.skipFileDependencyResolution)
      project.resolveSourceFileDependencies();
  }

  return project;
}

/**
 * Synchronously creates a new collection of source files to analyze.
 * @param options Options for creating the project.
 */
export function createProjectSync(options: ProjectOptions = {}): Project {
  const { project, tsConfigResolver } = createProjectCommon(options);

  // add any file paths from the tsconfig if necessary
  if (tsConfigResolver != null && options.skipAddingFilesFromTsConfig !== true) {
    project._addSourceFilesForTsConfigResolverSync(tsConfigResolver, project.compilerOptions.get());

    if (!options.skipFileDependencyResolution)
      project.resolveSourceFileDependencies();
  }

  return project;
}

function createProjectCommon(options: ProjectOptions) {
  verifyOptions();

  const fileSystem = getFileSystem();
  const fileSystemWrapper = new TransactionalFileSystem({
    fileSystem,
    libFolderPath: options.libFolderPath,
    skipLoadingLibFiles: options.skipLoadingLibFiles,
  });

  // get tsconfig info
  const tsConfigResolver = options.tsConfigFilePath == null
    ? undefined
    : new TsConfigResolver(
      fileSystemWrapper,
      fileSystemWrapper.getStandardizedAbsolutePath(options.tsConfigFilePath),
      getEncodingFromProvidedOptions(),
    );

  const project = new Project({
    fileSystem,
    fileSystemWrapper,
    tsConfigResolver,
  }, options);

  return { project, tsConfigResolver };

  function verifyOptions() {
    if (options.fileSystem != null && options.useInMemoryFileSystem)
      throw new errors.InvalidOperationError("Cannot provide a file system when specifying to use an in-memory file system.");
  }

  function getFileSystem() {
    if (options.useInMemoryFileSystem)
      return new InMemoryFileSystemHost();
    return options.fileSystem ?? new RealFileSystemHost();
  }

  function getEncodingFromProvidedOptions() {
    const defaultEncoding = "utf-8";
    if (options.compilerOptions != null)
      return options.compilerOptions.charset || defaultEncoding;
    return defaultEncoding;
  }
}

/** Project that holds source files. */
export class Project {
  readonly #sourceFileCache: SourceFileCache;
  readonly #fileSystemWrapper: TransactionalFileSystem;
  readonly #languageServiceHost: ts.LanguageServiceHost;
  readonly #compilerHost: ts.CompilerHost;
  readonly #configFileParsingDiagnostics: ts.Diagnostic[];

  /** @private */
  constructor(objs: {
    fileSystem: FileSystemHost;
    fileSystemWrapper: TransactionalFileSystem;
    tsConfigResolver: TsConfigResolver | undefined;
  }, options: ProjectOptions) {
    const { tsConfigResolver } = objs;
    this.fileSystem = objs.fileSystem;
    this.#fileSystemWrapper = objs.fileSystemWrapper;

    // initialize the compiler options
    const tsCompilerOptions = getCompilerOptions();
    this.compilerOptions = new CompilerOptionsContainer();
    this.compilerOptions.set(tsCompilerOptions);

    // initialize the source file cache
    this.#sourceFileCache = new SourceFileCache(this.#fileSystemWrapper, this.compilerOptions);

    // initialize the compiler resolution host
    const resolutionHost = !options.resolutionHost
      ? undefined
      : options.resolutionHost(this.getModuleResolutionHost(), () => this.compilerOptions.get());
    // setup context
    const newLineKind = "\n";
    const { languageServiceHost, compilerHost } = createHosts({
      transactionalFileSystem: this.#fileSystemWrapper,
      sourceFileContainer: this.#sourceFileCache,
      compilerOptions: this.compilerOptions,
      getNewLine: () => newLineKind,
      resolutionHost: resolutionHost || {},
      getProjectVersion: () => this.#sourceFileCache.getProjectVersion().toString(),
      isKnownTypesPackageName: options.isKnownTypesPackageName,
      libFolderPath: options.libFolderPath,
      skipLoadingLibFiles: options.skipLoadingLibFiles,
    });
    this.#languageServiceHost = languageServiceHost;
    this.#compilerHost = compilerHost;
    this.#configFileParsingDiagnostics = tsConfigResolver?.getErrors() ?? [];

    function getCompilerOptions(): ts.CompilerOptions {
      return {
        ...getTsConfigCompilerOptions(),
        ...(options.compilerOptions || {}) as ts.CompilerOptions,
      };
    }

    function getTsConfigCompilerOptions() {
      if (tsConfigResolver == null)
        return {};
      return tsConfigResolver.getCompilerOptions();
    }
  }

  /** Gets the compiler options for modification. */
  readonly compilerOptions: CompilerOptionsContainer;

  /** Gets the file system host used for this project. */
  readonly fileSystem: FileSystemHost;

  /**
   * Asynchronously adds an existing source file from a file path or throws if it doesn't exist.
   *
   * Will return the source file if it was already added.
   * @param filePath - File path to get the file from.
   * @param options - Options for adding the file.
   * @throws FileNotFoundError when the file is not found.
   */
  async addSourceFileAtPath(filePath: string, options?: { scriptKind?: ts.ScriptKind }): Promise<ts.SourceFile> {
    const sourceFile = await this.addSourceFileAtPathIfExists(filePath, options);
    if (sourceFile == null)
      throw new errors.FileNotFoundError(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath));
    return sourceFile;
  }

  /**
   * Synchronously adds an existing source file from a file path or throws if it doesn't exist.
   *
   * Will return the source file if it was already added.
   * @param filePath - File path to get the file from.
   * @param options - Options for adding the file.
   * @throws FileNotFoundError when the file is not found.
   */
  addSourceFileAtPathSync(filePath: string, options?: { scriptKind?: ts.ScriptKind }): ts.SourceFile {
    const sourceFile = this.addSourceFileAtPathIfExistsSync(filePath, options);
    if (sourceFile == null)
      throw new errors.FileNotFoundError(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath));
    return sourceFile;
  }

  /**
   * Asynchronously adds a source file from a file path if it exists or returns undefined.
   *
   * Will return the source file if it was already added.
   * @param filePath - File path to get the file from.
   * @param options - Options for adding the file.
   * @skipOrThrowCheck
   */
  addSourceFileAtPathIfExists(filePath: string, options?: { scriptKind?: ts.ScriptKind }): Promise<ts.SourceFile | undefined> {
    return this.#sourceFileCache.addOrGetSourceFileFromFilePath(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath), {
      scriptKind: options && options.scriptKind,
    });
  }

  /**
   * Synchronously adds a source file from a file path if it exists or returns undefined.
   *
   * Will return the source file if it was already added.
   * @param filePath - File path to get the file from.
   * @param options - Options for adding the file.
   * @skipOrThrowCheck
   */
  addSourceFileAtPathIfExistsSync(filePath: string, options?: { scriptKind?: ts.ScriptKind }): ts.SourceFile | undefined {
    return this.#sourceFileCache.addOrGetSourceFileFromFilePathSync(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath), {
      scriptKind: options && options.scriptKind,
    });
  }

  /**
   * Asynchronously adds source files based on file globs.
   * @param fileGlobs - File glob or globs to add files based on.
   * @returns The matched source files.
   */
  async addSourceFilesByPaths(fileGlobs: string | ReadonlyArray<string>): Promise<ts.SourceFile[]> {
    if (typeof fileGlobs === "string")
      fileGlobs = [fileGlobs];

    const sourceFilePromises: Promise<void>[] = [];
    const sourceFiles: ts.SourceFile[] = [];

    for (const filePath of await this.#fileSystemWrapper.glob(fileGlobs)) {
      sourceFilePromises.push(
        this.addSourceFileAtPathIfExists(filePath).then(sourceFile => {
          if (sourceFile != null)
            sourceFiles.push(sourceFile);
        }),
      );
    }

    await Promise.all(sourceFilePromises);
    return sourceFiles;
  }

  /**
   * Synchronously adds source files based on file globs.
   * @param fileGlobs - File glob or globs to add files based on.
   * @returns The matched source files.
   * @remarks This is much slower than the asynchronous version.
   */
  addSourceFilesByPathsSync(fileGlobs: string | ReadonlyArray<string>): ts.SourceFile[] {
    if (typeof fileGlobs === "string")
      fileGlobs = [fileGlobs];

    const sourceFiles: ts.SourceFile[] = [];

    for (const filePath of this.#fileSystemWrapper.globSync(fileGlobs)) {
      const sourceFile = this.addSourceFileAtPathIfExistsSync(filePath);
      if (sourceFile != null)
        sourceFiles.push(sourceFile);
    }

    return sourceFiles;
  }

  /**
   * Asynchronously adds all the source files from the specified tsconfig.json.
   *
   * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
   * `skipAddingSourceFilesFromTsConfig` option to `true`.
   * @param tsConfigFilePath - File path to the tsconfig.json file.
   */
  addSourceFilesFromTsConfig(tsConfigFilePath: string): Promise<ts.SourceFile[]> {
    const resolver = this.#getTsConfigResolver(tsConfigFilePath);
    return this._addSourceFilesForTsConfigResolver(resolver, resolver.getCompilerOptions());
  }

  /**
   * Synchronously adds all the source files from the specified tsconfig.json.
   *
   * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
   * `skipAddingSourceFilesFromTsConfig` option to `true`.
   * @param tsConfigFilePath - File path to the tsconfig.json file.
   */
  addSourceFilesFromTsConfigSync(tsConfigFilePath: string): ts.SourceFile[] {
    const resolver = this.#getTsConfigResolver(tsConfigFilePath);
    return this._addSourceFilesForTsConfigResolverSync(resolver, resolver.getCompilerOptions());
  }

  #getTsConfigResolver(tsConfigFilePath: string) {
    const standardizedFilePath = this.#fileSystemWrapper.getStandardizedAbsolutePath(tsConfigFilePath);
    return new TsConfigResolver(this.#fileSystemWrapper, standardizedFilePath, this.compilerOptions.getEncoding());
  }

  /**
   * Creates a source file at the specified file path with the specified text.
   *
   * Note: The file will not be created and saved to the file system until .save() is called on the source file.
   * @param filePath - File path of the source file.
   * @param sourceFileText - Text to use for the source file.
   * @param options - Options.
   * @throws - InvalidOperationError if a source file already exists at the provided file path.
   */
  createSourceFile(
    filePath: string,
    sourceFileText?: string,
    options?: { scriptKind?: ts.ScriptKind },
  ): ts.SourceFile {
    return this.#sourceFileCache.createSourceFileFromText(
      this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath),
      sourceFileText || "",
      { scriptKind: options && options.scriptKind },
    );
  }

  /**
   * Updates the source file stored in the project at the specified path.
   * @param filePath - File path of the source file.
   * @param sourceFileText - Text of the source file.
   * @param options - Options for updating the source file.
   */
  updateSourceFile(filePath: string, sourceFileText: string, options?: { scriptKind?: ts.ScriptKind }): ts.SourceFile;
  /**
   * Updates the source file stored in the project. The `fileName` of the source file object is used to tell which file to update.
   * @param newSourceFile - The new source file.
   */
  updateSourceFile(newSourceFile: ts.SourceFile): ts.SourceFile;
  updateSourceFile(filePathOrSourceFile: string | ts.SourceFile, sourceFileText?: string, options?: { scriptKind?: ts.ScriptKind }) {
    if (typeof filePathOrSourceFile === "string")
      return this.createSourceFile(filePathOrSourceFile, sourceFileText, options);

    // ensure this has the language service properties set
    incrementVersion(filePathOrSourceFile);
    ensureScriptSnapshot(filePathOrSourceFile);

    return this.#sourceFileCache.setSourceFile(filePathOrSourceFile);

    function incrementVersion(sourceFile: ts.SourceFile) {
      let version = (sourceFile as any).version || "-1";
      const parsedVersion = parseInt(version, 10);
      if (isNaN(parsedVersion))
        version = "0";
      else
        version = (parsedVersion + 1).toString();

      (sourceFile as any).version = version;
    }

    function ensureScriptSnapshot(sourceFile: ts.SourceFile) {
      if ((sourceFile as any).scriptSnapshot == null)
        (sourceFile as any).scriptSnapshot = ts.ScriptSnapshot.fromString(sourceFile.text);
    }
  }

  /**
   * Removes the source file at the provided file path.
   * @param filePath - File path of the source file.
   */
  removeSourceFile(filePath: string): void;
  /**
   * Removes the provided source file based on its `fileName`.
   * @param sourceFile - Source file to remove.
   */
  removeSourceFile(sourceFile: ts.SourceFile): void;
  removeSourceFile(filePathOrSourceFile: string | ts.SourceFile) {
    this.#sourceFileCache.removeSourceFile(this.#fileSystemWrapper.getStandardizedAbsolutePath(
      typeof filePathOrSourceFile === "string" ? filePathOrSourceFile : filePathOrSourceFile.fileName,
    ));
  }

  /**
   * Adds the source files the project's source files depend on to the project.
   * @remarks
   * * This should be done after source files are added to the project, preferably once to
   * avoid doing more work than necessary.
   * * This is done by default when creating a Project and providing a tsconfig.json and
   * not specifying to not add the source files.
   */
  resolveSourceFileDependencies() {
    // creating a program will resolve any dependencies
    this.createProgram();
  }

  /** @internal */
  async _addSourceFilesForTsConfigResolver(tsConfigResolver: TsConfigResolver, compilerOptions: ts.CompilerOptions) {
    const sourceFiles: ts.SourceFile[] = [];
    await Promise.all(
      tsConfigResolver.getPaths(compilerOptions).filePaths
        .map(p => this.addSourceFileAtPath(p).then(s => sourceFiles.push(s))),
    );
    return sourceFiles;
  }

  /** @internal */
  _addSourceFilesForTsConfigResolverSync(tsConfigResolver: TsConfigResolver, compilerOptions: ts.CompilerOptions) {
    return tsConfigResolver.getPaths(compilerOptions).filePaths.map(p => this.addSourceFileAtPathSync(p));
  }

  /** @internal */
  #oldProgram: ts.Program | undefined;

  /**
   * Creates a new program.
   * Note: You should get a new program any time source files are added, removed, or changed.
   */
  createProgram(options?: ts.CreateProgramOptions): ts.Program {
    const oldProgram = this.#oldProgram;
    const program = ts.createProgram({
      rootNames: Array.from(this.#sourceFileCache.getSourceFilePaths()),
      options: this.compilerOptions.get(),
      host: this.#compilerHost,
      oldProgram,
      configFileParsingDiagnostics: this.#configFileParsingDiagnostics,
      ...options,
    });
    this.#oldProgram = program;
    return program;
  }

  /**
   * Gets the language service.
   */
  @Memoize
  getLanguageService(): ts.LanguageService {
    return ts.createLanguageService(this.#languageServiceHost, this.#sourceFileCache.documentRegistry);
  }

  /**
   * Gets a source file by a file name or file path. Throws an error if it doesn't exist.
   * @param fileNameOrPath - File name or path that the path could end with or equal.
   */
  getSourceFileOrThrow(fileNameOrPath: string): ts.SourceFile;
  /**
   * Gets a source file by a search function. Throws an error if it doesn't exist.
   * @param searchFunction - Search function.
   */
  getSourceFileOrThrow(searchFunction: (file: ts.SourceFile) => boolean): ts.SourceFile;
  getSourceFileOrThrow(fileNameOrSearchFunction: string | ((file: ts.SourceFile) => boolean)): ts.SourceFile {
    const sourceFile = this.getSourceFile(fileNameOrSearchFunction);
    if (sourceFile != null)
      return sourceFile;

    // explain to the user why it couldn't find the file
    if (typeof fileNameOrSearchFunction === "string") {
      const fileNameOrPath = FileUtils.standardizeSlashes(fileNameOrSearchFunction);
      if (FileUtils.pathIsAbsolute(fileNameOrPath) || fileNameOrPath.indexOf("/") >= 0) {
        const errorFileNameOrPath = this.#fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
        throw new errors.InvalidOperationError(`Could not find source file in project at the provided path: ${errorFileNameOrPath}`);
      } else {
        throw new errors.InvalidOperationError(`Could not find source file in project with the provided file name: ${fileNameOrSearchFunction}`);
      }
    } else {
      throw new errors.InvalidOperationError(`Could not find source file in project based on the provided condition.`);
    }
  }

  /**
   * Gets a source file by a file name or file path. Returns undefined if none exists.
   * @param fileNameOrPath - File name or path that the path could end with or equal.
   */
  getSourceFile(fileNameOrPath: string): ts.SourceFile | undefined;
  /**
   * Gets a source file by a search function. Returns undefined if none exists.
   * @param searchFunction - Search function.
   */
  getSourceFile(searchFunction: (file: ts.SourceFile) => boolean): ts.SourceFile | undefined;
  /**
   * @internal
   */
  getSourceFile(fileNameOrSearchFunction: string | ((file: ts.SourceFile) => boolean)): ts.SourceFile | undefined;
  getSourceFile(fileNameOrSearchFunction: string | ((file: ts.SourceFile) => boolean)): ts.SourceFile | undefined {
    const filePathOrSearchFunction = getFilePathOrSearchFunction(this.#fileSystemWrapper);

    if (isStandardizedFilePath(filePathOrSearchFunction)) {
      // when a file path is specified, return even source files not in the project
      return this.#sourceFileCache.getSourceFileFromCacheFromFilePath(filePathOrSearchFunction);
    }

    const allSourceFilesIterable = this.getSourceFiles();
    return selectSmallestDirPathResult(function*() {
      for (const sourceFile of allSourceFilesIterable) {
        if (filePathOrSearchFunction(sourceFile))
          yield sourceFile;
      }
    }());

    function getFilePathOrSearchFunction(fileSystemWrapper: TransactionalFileSystem): StandardizedFilePath | ((file: ts.SourceFile) => boolean) {
      if (fileNameOrSearchFunction instanceof Function)
        return fileNameOrSearchFunction;

      const fileNameOrPath = FileUtils.standardizeSlashes(fileNameOrSearchFunction);
      if (FileUtils.pathIsAbsolute(fileNameOrPath) || fileNameOrPath.indexOf("/") >= 0)
        return fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
      else
        return def => FileUtils.pathEndsWith(def.fileName, fileNameOrPath);
    }

    function selectSmallestDirPathResult(results: Iterable<ts.SourceFile>) {
      let result: ts.SourceFile | undefined;
      // Select the result with the shortest directory path... this could be more efficient
      // and better, but it will do for now...
      for (const sourceFile of results) {
        if (result == null || FileUtils.getDirPath(sourceFile.fileName).length < FileUtils.getDirPath(result.fileName).length)
          result = sourceFile;
      }
      return result;
    }

    // workaround to help the type checker figure this out
    function isStandardizedFilePath(obj: any): obj is StandardizedFilePath {
      return typeof obj === "string";
    }
  }

  /** Gets the source files in the project. */
  getSourceFiles() {
    return Array.from(this.#sourceFileCache.getSourceFiles());
  }

  /**
   * Formats an array of diagnostics with their color and context into a string.
   * @param diagnostics - Diagnostics to get a string of.
   * @param options - Collection of options. For example, the new line character to use (defaults to the OS' new line character).
   */
  formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<ts.Diagnostic>, opts: { newLineChar?: "\n" | "\r\n" } = {}) {
    return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => this.#fileSystemWrapper.getCurrentDirectory(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => opts.newLineChar || runtime.getEndOfLine(),
    });
  }

  /**
   * Gets a ts.ModuleResolutionHost for the project.
   */
  @Memoize
  getModuleResolutionHost(): ts.ModuleResolutionHost {
    return createModuleResolutionHost({
      transactionalFileSystem: this.#fileSystemWrapper,
      getEncoding: () => this.compilerOptions.getEncoding(),
      sourceFileContainer: this.#sourceFileCache,
    });
  }
}
