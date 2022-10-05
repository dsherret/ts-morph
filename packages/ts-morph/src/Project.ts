import {
  CompilerOptions,
  CompilerOptionsContainer,
  errors,
  FileSystemHost,
  FileUtils,
  InMemoryFileSystemHost,
  IterableUtils,
  matchGlobs,
  RealFileSystemHost,
  ResolutionHostFactory,
  runtime,
  ScriptKind,
  StandardizedFilePath,
  TransactionalFileSystem,
  ts,
  TsConfigResolver,
} from "@ts-morph/common";
import { CodeBlockWriter } from "./codeBlockWriter";
import { Diagnostic, EmitOptions, EmitResult, LanguageService, Node, Program, SourceFile, TypeChecker } from "./compiler";
import { Directory, DirectoryAddOptions } from "./fileSystem";
import { ManipulationSettings, ManipulationSettingsContainer } from "./options";
import { ProjectContext } from "./ProjectContext";
import { OptionalKind, SourceFileStructure } from "./structures";
import { WriterFunction } from "./types";

/** Options for creating a project. */
export interface ProjectOptions {
  /** Compiler options */
  compilerOptions?: CompilerOptions;
  /** File path to the tsconfig.json file. */
  tsConfigFilePath?: string;
  /** Whether to skip adding the source files from the specified tsconfig.json. @default false */
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
  /** Manipulation settings */
  manipulationSettings?: Partial<ManipulationSettings>;
  /** Whether to use an in-memory file system. @default false */
  useInMemoryFileSystem?: boolean;
  /**
   * Optional file system host. Useful for mocking access to the file system.
   * @remarks Consider using `useInMemoryFileSystem` instead.
   */
  fileSystem?: FileSystemHost;
  /** Creates a resolution host for specifying custom module and/or type reference directive resolution. */
  resolutionHost?: ResolutionHostFactory;
}

/** Options for creating a source file. */
export interface SourceFileCreateOptions {
  /**
   * Whether a source file should be overwritten if it exists. Defaults to false.
   * @remarks When false, the method will throw when a file exists.
   */
  overwrite?: boolean;
  /**
   * Specifies the script kind of the source file.
   */
  scriptKind?: ScriptKind;
}

/**
 * Project that holds source files.
 */
export class Project {
  /** @internal */
  readonly _context: ProjectContext;

  /**
   * Initializes a new instance.
   * @param options - Optional options.
   */
  constructor(options: ProjectOptions = {}) {
    verifyOptions();

    // setup file system
    const fileSystem = getFileSystem();
    const fileSystemWrapper = new TransactionalFileSystem({
      fileSystem,
      skipLoadingLibFiles: options.skipLoadingLibFiles,
      libFolderPath: options.libFolderPath,
    });

    // get tsconfig info
    const tsConfigResolver = options.tsConfigFilePath == null
      ? undefined
      : new TsConfigResolver(fileSystemWrapper, fileSystemWrapper.getStandardizedAbsolutePath(options.tsConfigFilePath), getEncoding());

    // compiler options initialization
    const compilerOptions = getCompilerOptions();
    const compilerOptionsContainer = new CompilerOptionsContainer();
    compilerOptionsContainer.set(compilerOptions);

    // setup context
    this._context = new ProjectContext({
      project: this,
      compilerOptionsContainer,
      fileSystemWrapper,
      createLanguageService: true,
      resolutionHost: options.resolutionHost,
      configFileParsingDiagnostics: tsConfigResolver?.getErrors() ?? [],
      skipLoadingLibFiles: options.skipLoadingLibFiles,
      libFolderPath: options.libFolderPath,
    });

    // initialize manipulation settings
    if (options.manipulationSettings != null)
      this._context.manipulationSettings.set(options.manipulationSettings);

    // add any file paths from the tsconfig if necessary
    if (tsConfigResolver != null && options.skipAddingFilesFromTsConfig !== true) {
      this._addSourceFilesForTsConfigResolver(tsConfigResolver, compilerOptions);

      if (!options.skipFileDependencyResolution)
        this.resolveSourceFileDependencies();
    }

    function verifyOptions() {
      if (options.fileSystem != null && options.useInMemoryFileSystem)
        throw new errors.InvalidOperationError("Cannot provide a file system when specifying to use an in-memory file system.");
    }

    function getFileSystem() {
      if (options.useInMemoryFileSystem)
        return new InMemoryFileSystemHost();
      return options.fileSystem ?? new RealFileSystemHost();
    }

    function getCompilerOptions(): CompilerOptions {
      return {
        ...getTsConfigCompilerOptions(),
        ...(options.compilerOptions ?? {}) as CompilerOptions,
      };
    }

    function getTsConfigCompilerOptions() {
      return tsConfigResolver?.getCompilerOptions() ?? {};
    }

    function getEncoding() {
      const defaultEncoding = "utf-8";
      if (options.compilerOptions != null)
        return options.compilerOptions.charset ?? defaultEncoding;
      return defaultEncoding;
    }
  }

  /** Gets the manipulation settings. */
  get manipulationSettings(): ManipulationSettingsContainer {
    return this._context.manipulationSettings;
  }

  /** Gets the compiler options for modification. */
  get compilerOptions(): CompilerOptionsContainer {
    return this._context.compilerOptions;
  }

  /**
   * Adds the source files the project's source files depend on to the project.
   * @returns The added source files.
   * @remarks
   * * This should be done after source files are added to the project, preferably once to
   * avoid doing more work than necessary.
   * * This is done by default when creating a Project and providing a tsconfig.json and
   * not specifying to not add the source files.
   */
  resolveSourceFileDependencies() {
    const sourceFiles = new Set<SourceFile>();
    const onSourceFileAdded = (sourceFile: SourceFile) => sourceFiles.add(sourceFile);
    const { compilerFactory, inProjectCoordinator } = this._context;

    compilerFactory.onSourceFileAdded(onSourceFileAdded);

    try {
      this.getProgram().compilerObject; // create the program
    } finally {
      compilerFactory.onSourceFileAdded(onSourceFileAdded, false); // unsubscribe
    }

    const result = inProjectCoordinator.markSourceFilesAsInProjectForResolution();
    for (const sourceFile of result.changedSourceFiles)
      sourceFiles.add(sourceFile);
    for (const sourceFile of result.unchangedSourceFiles)
      sourceFiles.delete(sourceFile);

    return Array.from(sourceFiles.values());
  }

  /**
   * Adds an existing directory from the path or returns undefined if it doesn't exist.
   *
   * Will return the directory if it was already added.
   * @param dirPath - Path to add the directory at.
   * @param options - Options.
   * @skipOrThrowCheck
   */
  addDirectoryAtPathIfExists(dirPath: string, options: DirectoryAddOptions = {}): Directory | undefined {
    return this._context.directoryCoordinator.addDirectoryAtPathIfExists(
      this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath),
      { ...options, markInProject: true },
    );
  }

  /**
   * Adds an existing directory from the path or throws if it doesn't exist.
   *
   * Will return the directory if it was already added.
   * @param dirPath - Path to add the directory at.
   * @param options - Options.
   * @throws DirectoryNotFoundError when the directory does not exist.
   */
  addDirectoryAtPath(dirPath: string, options: DirectoryAddOptions = {}): Directory {
    return this._context.directoryCoordinator.addDirectoryAtPath(
      this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath),
      { ...options, markInProject: true },
    );
  }

  /**
   * Creates a directory at the specified path.
   * @param dirPath - Path to create the directory at.
   */
  createDirectory(dirPath: string): Directory {
    return this._context.directoryCoordinator.createDirectoryOrAddIfExists(
      this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath),
      { markInProject: true },
    );
  }

  /**
   * Gets a directory by the specified path or throws if it doesn't exist.
   * @param dirPath - Path to create the directory at.
   */
  getDirectoryOrThrow(dirPath: string, message?: string | (() => string)): Directory {
    return errors.throwIfNullOrUndefined(
      this.getDirectory(dirPath),
      () => message || `Could not find a directory at the specified path: ${this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath)}`, this,
    );
  }

  /**
   * Gets a directory by the specified path or returns undefined if it doesn't exist.
   * @param dirPath - Directory path.
   */
  getDirectory(dirPath: string): Directory | undefined {
    const { compilerFactory } = this._context;
    // when a directory path is specified, even return directories not in the project
    return compilerFactory.getDirectoryFromCache(this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath));
  }

  /**
   * Gets all the directories.
   */
  getDirectories() {
    return Array.from(this._getProjectDirectoriesByDirectoryDepth());
  }

  /**
   * Gets the directories without a parent.
   */
  getRootDirectories() {
    const { inProjectCoordinator } = this._context;
    const result: Directory[] = [];

    for (const dir of this._context.compilerFactory.getOrphanDirectories()) {
      for (const inProjectDir of findInProjectDirectories(dir))
        result.push(inProjectDir);
    }

    return result;

    function* findInProjectDirectories(dir: Directory): Iterable<Directory> {
      if (inProjectCoordinator.isDirectoryInProject(dir)) {
        yield dir;
        return;
      }

      for (const childDir of dir._getDirectoriesIterator())
        yield* findInProjectDirectories(childDir);
    }
  }

  /**
   * Adds source files based on file globs.
   * @param fileGlobs - File glob or globs to add files based on.
   * @returns The matched source files.
   */
  addSourceFilesAtPaths(fileGlobs: string | ReadonlyArray<string>): SourceFile[] {
    return this._context.directoryCoordinator.addSourceFilesAtPaths(fileGlobs, { markInProject: true });
  }

  /**
   * Adds a source file from a file path if it exists or returns undefined.
   *
   * Will return the source file if it was already added.
   * @param filePath - File path to get the file from.
   * @skipOrThrowCheck
   */
  addSourceFileAtPathIfExists(filePath: string): SourceFile | undefined {
    return this._context.directoryCoordinator.addSourceFileAtPathIfExists(this._context.fileSystemWrapper.getStandardizedAbsolutePath(filePath), {
      markInProject: true,
    });
  }

  /**
   * Adds an existing source file from a file path or throws if it doesn't exist.
   *
   * Will return the source file if it was already added.
   * @param filePath - File path to get the file from.
   * @throws FileNotFoundError when the file is not found.
   */
  addSourceFileAtPath(filePath: string): SourceFile {
    return this._context.directoryCoordinator.addSourceFileAtPath(this._context.fileSystemWrapper.getStandardizedAbsolutePath(filePath), {
      markInProject: true,
    });
  }

  /**
   * Adds all the source files from the specified tsconfig.json.
   *
   * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
   * `skipAddingFilesFromTsConfig` option to `true`.
   * @param tsConfigFilePath - File path to the tsconfig.json file.
   */
  addSourceFilesFromTsConfig(tsConfigFilePath: string): SourceFile[] {
    const resolver = new TsConfigResolver(
      this._context.fileSystemWrapper,
      this._context.fileSystemWrapper.getStandardizedAbsolutePath(tsConfigFilePath),
      this._context.getEncoding(),
    );
    return this._addSourceFilesForTsConfigResolver(resolver, resolver.getCompilerOptions());
  }

  /** @internal */
  private _addSourceFilesForTsConfigResolver(tsConfigResolver: TsConfigResolver, compilerOptions: CompilerOptions) {
    const paths = tsConfigResolver.getPaths(compilerOptions);

    const addedSourceFiles = paths.filePaths.map(p => this.addSourceFileAtPath(p));
    for (const dirPath of paths.directoryPaths)
      this.addDirectoryAtPathIfExists(dirPath);
    return addedSourceFiles;
  }

  /**
   * Creates a source file at the specified file path with the specified text.
   *
   * Note: The file will not be created and saved to the file system until .save() is called on the source file.
   * @param filePath - File path of the source file.
   * @param sourceFileText - Text, structure, or writer function for the source file text.
   * @param options - Options.
   * @throws - InvalidOperationError if a source file already exists at the provided file path.
   */
  createSourceFile(
    filePath: string,
    sourceFileText?: string | OptionalKind<SourceFileStructure> | WriterFunction,
    options?: SourceFileCreateOptions,
  ): SourceFile {
    return this._context.compilerFactory.createSourceFile(
      this._context.fileSystemWrapper.getStandardizedAbsolutePath(filePath),
      sourceFileText ?? "",
      { ...(options ?? {}), markInProject: true },
    );
  }

  /**
   * Removes a source file from the project.
   * @param sourceFile - Source file to remove.
   * @returns True if removed.
   */
  removeSourceFile(sourceFile: SourceFile) {
    const previouslyForgotten = sourceFile.wasForgotten();
    sourceFile.forget();
    return !previouslyForgotten;
  }

  /**
   * Gets a source file by a file name or file path. Throws an error if it doesn't exist.
   * @param fileNameOrPath - File name or path that the path could end with or equal.
   */
  getSourceFileOrThrow(fileNameOrPath: string): SourceFile;
  /**
   * Gets a source file by a search function. Throws an error if it doesn't exist.
   * @param searchFunction - Search function.
   */
  getSourceFileOrThrow(searchFunction: (file: SourceFile) => boolean): SourceFile;
  getSourceFileOrThrow(fileNameOrSearchFunction: string | ((file: SourceFile) => boolean)): SourceFile {
    const sourceFile = this.getSourceFile(fileNameOrSearchFunction);
    if (sourceFile != null)
      return sourceFile;

    // explain to the user why it couldn't find the file
    if (typeof fileNameOrSearchFunction === "string") {
      const fileNameOrPath = FileUtils.standardizeSlashes(fileNameOrSearchFunction);
      if (FileUtils.pathIsAbsolute(fileNameOrPath) || fileNameOrPath.indexOf("/") >= 0) {
        const errorFileNameOrPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
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
  getSourceFile(fileNameOrPath: string): SourceFile | undefined;
  /**
   * Gets a source file by a search function. Returns undefined if none exists.
   * @param searchFunction - Search function.
   */
  getSourceFile(searchFunction: (file: SourceFile) => boolean): SourceFile | undefined;
  /**
   * @internal
   */
  getSourceFile(fileNameOrSearchFunction: string | ((file: SourceFile) => boolean)): SourceFile | undefined;
  getSourceFile(fileNameOrSearchFunction: string | ((file: SourceFile) => boolean)): SourceFile | undefined {
    const filePathOrSearchFunction = getFilePathOrSearchFunction(this._context.fileSystemWrapper);

    if (isStandardizedFilePath(filePathOrSearchFunction)) {
      // when a file path is specified, return even source files not in the project
      return this._context.compilerFactory.getSourceFileFromCacheFromFilePath(filePathOrSearchFunction);
    }

    return IterableUtils.find(this._getProjectSourceFilesByDirectoryDepth(), filePathOrSearchFunction);

    function getFilePathOrSearchFunction(fileSystemWrapper: TransactionalFileSystem): StandardizedFilePath | ((file: SourceFile) => boolean) {
      if (fileNameOrSearchFunction instanceof Function)
        return fileNameOrSearchFunction;

      const fileNameOrPath = FileUtils.standardizeSlashes(fileNameOrSearchFunction);
      if (FileUtils.pathIsAbsolute(fileNameOrPath) || fileNameOrPath.indexOf("/") >= 0)
        return fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
      else
        return def => FileUtils.pathEndsWith(def.getFilePath(), fileNameOrPath);
    }

    // workaround to help the type checker figure this out
    function isStandardizedFilePath(obj: any): obj is StandardizedFilePath {
      return typeof obj === "string";
    }
  }

  /**
   * Gets all the source files added to the project.
   */
  getSourceFiles(): SourceFile[];
  /**
   * Gets all the source files added to the project that match a pattern.
   * @param globPattern - Glob pattern for filtering out the source files.
   */
  getSourceFiles(globPattern: string): SourceFile[];
  /**
   * Gets all the source files added to the project that match the passed in patterns.
   * @param globPatterns - Glob patterns for filtering out the source files.
   */
  getSourceFiles(globPatterns: ReadonlyArray<string>): SourceFile[];
  getSourceFiles(globPatterns?: string | ReadonlyArray<string>): SourceFile[] {
    const { compilerFactory, fileSystemWrapper } = this._context;
    const sourceFiles = this._getProjectSourceFilesByDirectoryDepth();

    if (typeof globPatterns === "string" || globPatterns instanceof Array)
      return Array.from(getFilteredSourceFiles());
    else
      return Array.from(sourceFiles);

    function* getFilteredSourceFiles() {
      const sourceFilePaths = Array.from(getSourceFilePaths());
      const matchedPaths = matchGlobs(sourceFilePaths, globPatterns!, fileSystemWrapper.getCurrentDirectory());

      for (const matchedPath of matchedPaths)
        yield compilerFactory.getSourceFileFromCacheFromFilePath(fileSystemWrapper.getStandardizedAbsolutePath(matchedPath))!;

      function* getSourceFilePaths() {
        for (const sourceFile of sourceFiles)
          yield sourceFile.getFilePath();
      }
    }
  }

  /** @internal */
  private *_getProjectSourceFilesByDirectoryDepth() {
    const { compilerFactory, inProjectCoordinator } = this._context;
    for (const sourceFile of compilerFactory.getSourceFilesByDirectoryDepth()) {
      if (inProjectCoordinator.isSourceFileInProject(sourceFile))
        yield sourceFile;
    }
  }

  /** @internal */
  private *_getProjectDirectoriesByDirectoryDepth() {
    const { compilerFactory, inProjectCoordinator } = this._context;
    for (const directory of compilerFactory.getDirectoriesByDepth()) {
      if (inProjectCoordinator.isDirectoryInProject(directory))
        yield directory;
    }
  }

  /**
   * Gets the specified ambient module symbol or returns undefined if not found.
   * @param moduleName - The ambient module name with or without quotes.
   */
  getAmbientModule(moduleName: string) {
    moduleName = normalizeAmbientModuleName(moduleName);
    return this.getAmbientModules().find(s => s.getName() === moduleName);
  }

  /**
   * Gets the specified ambient module symbol or throws if not found.
   * @param moduleName - The ambient module name with or without quotes.
   */
  getAmbientModuleOrThrow(moduleName: string, message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(
      this.getAmbientModule(moduleName),
      () => message || `Could not find ambient module with name: ${normalizeAmbientModuleName(moduleName)}`, this,
    );
  }

  /**
   * Gets the ambient module symbols (ex. modules in the @types folder or node_modules).
   */
  getAmbientModules() {
    return this.getTypeChecker().getAmbientModules();
  }

  /**
   * Saves all the unsaved source files to the file system and deletes all deleted files.
   */
  async save() {
    await this._context.fileSystemWrapper.flush();
    await Promise.all(this._getUnsavedSourceFiles().map(f => f.save()));
  }

  /**
   * Synchronously saves all the unsaved source files to the file system and deletes all deleted files.
   *
   * Remarks: This might be very slow compared to the asynchronous version if there are a lot of files.
   */
  saveSync() {
    this._context.fileSystemWrapper.flushSync();
    // sidenote: I wish I could do something like in c# where I do this all asynchronously then
    // wait synchronously on the task. It would not be as bad as this is performance wise. Maybe there
    // is a way, but people just shouldn't be using this method unless they're really lazy.
    for (const file of this._getUnsavedSourceFiles())
      file.saveSync();
  }

  /**
   * Enables logging to the console.
   * @param enabled - Enabled.
   */
  enableLogging(enabled = true) {
    this._context.logger.setEnabled(enabled);
  }

  /** @internal */
  private _getUnsavedSourceFiles() {
    return Array.from(getUnsavedIterator(this._context.compilerFactory.getSourceFilesByDirectoryDepth()));

    function* getUnsavedIterator(sourceFiles: IterableIterator<SourceFile>) {
      for (const sourceFile of sourceFiles) {
        if (!sourceFile.isSaved())
          yield sourceFile;
      }
    }
  }

  /**
   * Gets the pre-emit diagnostics.
   */
  getPreEmitDiagnostics(): Diagnostic[] {
    return this._context.getPreEmitDiagnostics();
  }

  /**
   * Gets the language service.
   */
  getLanguageService(): LanguageService {
    return this._context.languageService;
  }

  /**
   * Gets the program.
   */
  getProgram(): Program {
    return this._context.program;
  }

  /**
   * Gets the type checker.
   */
  getTypeChecker(): TypeChecker {
    return this._context.typeChecker;
  }

  /**
   * Gets the file system.
   */
  getFileSystem(): FileSystemHost {
    return this._context.fileSystemWrapper.getFileSystem();
  }

  /**
   * Asynchronously emits all the source files to the file system as JavaScript files.
   * @param emitOptions - Optional emit options.
   */
  emit(emitOptions: EmitOptions = {}): Promise<EmitResult> {
    return this._context.program.emit(emitOptions);
  }

  /**
   * Synchronously emits all the source files to the file system as JavaScript files.
   * @param emitOptions - Optional emit options.
   */
  emitSync(emitOptions: EmitOptions = {}): EmitResult {
    return this._context.program.emitSync(emitOptions);
  }

  /**
   * Emits all the source files to memory.
   * @param emitOptions - Optional emit options.
   */
  emitToMemory(emitOptions: EmitOptions = {}) {
    return this._context.program.emitToMemory(emitOptions);
  }

  /**
   * Gets the compiler options.
   */
  getCompilerOptions(): CompilerOptions {
    return this._context.compilerOptions.get();
  }

  /**
   * Gets the diagnostics found when parsing the tsconfig.json file provided in the project's constructor.
   */
  getConfigFileParsingDiagnostics(): Diagnostic[] {
    return this.getProgram().getConfigFileParsingDiagnostics();
  }

  /**
   * Creates a writer with the current manipulation settings.
   * @remarks Generally it's best to use a provided writer, but this may be useful in some scenarios.
   */
  createWriter(): CodeBlockWriter {
    return this._context.createWriter();
  }

  /**
   * Forgets the nodes created in the scope of the passed in block.
   *
   * This is an advanced method that can be used to easily "forget" all the nodes created within the scope of the block.
   * @param block - Block of code to run. Use the `remember` callback or return a node to remember it.
   */
  forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => T): T;
  /**
   * Forgets the nodes created in the scope of the passed in block asynchronously.
   *
   * This is an advanced method that can be used to easily "forget" all the nodes created within the scope of the block.
   * @param block - Block of code to run. Use the `remember` callback or return a node to remember it.
   */
  forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => Promise<T>): Promise<T>;
  forgetNodesCreatedInBlock(block: (remember: (...node: Node[]) => void) => void | Promise<void>) {
    return this._context.compilerFactory.forgetNodesCreatedInBlock(block);
  }

  /**
   * Formats an array of diagnostics with their color and context into a string.
   * @param diagnostics - Diagnostics to get a string of.
   * @param options - Collection of options. For example, the new line character to use (defaults to the OS' new line character).
   */
  formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<Diagnostic>, opts: { newLineChar?: "\n" | "\r\n" } = {}) {
    return ts.formatDiagnosticsWithColorAndContext(diagnostics.map(d => d.compilerObject), {
      getCurrentDirectory: () => this._context.fileSystemWrapper.getCurrentDirectory(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => opts.newLineChar ?? runtime.getEndOfLine(),
    });
  }

  /**
   * Gets a ts.ModuleResolutionHost for the project.
   */
  getModuleResolutionHost(): ts.ModuleResolutionHost {
    return this._context.getModuleResolutionHost();
  }
}

function normalizeAmbientModuleName(moduleName: string) {
  if (isQuote(moduleName[0]) && isQuote(moduleName[moduleName.length - 1]))
    moduleName = moduleName.substring(1, moduleName.length - 1);
  return `"${moduleName}"`;

  function isQuote(char: string) {
    return char === `"` || char === "'";
  }
}
