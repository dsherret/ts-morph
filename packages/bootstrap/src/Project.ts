import {
  CompilerOptionsContainer,
  createModuleResolutionHost,
  errors,
  FileSystemHost,
  FileUtils,
  InMemoryFileSystemHost,
  isCompilerOwnedPath,
  RealFileSystemHost,
  type ResolutionHostFactory,
  runtime,
  StandardizedFilePath,
  StringUtils,
  TransactionalFileSystem,
  ts,
  TsConfigResolver,
} from "@ts-morph/common";
import { SourceFileCache } from "./SourceFileCache";

/**
 * Options for adding or creating a source file.
 *
 * The compiler owns parsing and derives the script kind from the file
 * extension, with no way to be told otherwise, so the one option here has no
 * effect and is kept only so existing calls still compile.
 */
export interface SourceFileOptions {
  /** @deprecated Has no effect — the script kind comes from the file extension. */
  scriptKind?: ts.ScriptKind;
}

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
   * Leave the lib files out of the project, so that nothing is in scope that a
   * file did not declare or import. The compiler reports the missing global types
   * as diagnostics, which is the point of the option rather than a side effect.
   * @default false
   */
  skipLoadingLibFiles?: boolean;
  /**
   * Folder to read the lib files from, through this project's file system.
   *
   * Defaults to the compiler's own copies, which are embedded in the wasm module
   * and so have no path on any file system.
   */
  libFolderPath?: string;
  /** Whether to use an in-memory file system. */
  useInMemoryFileSystem?: boolean;
  /**
   * Optional file system host. Useful for mocking access to the file system.
   * @remarks Consider using `useInMemoryFileSystem` instead.
   */
  fileSystem?: FileSystemHost;
  /**
   * Resolves module specifiers in place of the compiler.
   *
   * The compiler asks the host before resolving anything itself, so a project
   * can resolve by rules the compiler does not implement. See
   * `ResolutionHosts.deno` for the ready-made one.
   *
   * Type reference directives are not covered — they resolve down a separate
   * path in the compiler that has no hook.
   */
  resolutionHost?: ResolutionHostFactory;
}

/**
 * Asynchronously creates a new collection of source files to analyze.
 * @param options Options for creating the project.
 */
export async function createProject(options: ProjectOptions = {}): Promise<Project> {
  const { project, tsConfigResolver } = createProjectCommon(options);

  // add any file paths from the tsconfig if necessary
  if (tsConfigResolver != null && options.skipAddingFilesFromTsConfig !== true) {
    await addSourceFilesForTsConfigResolver(project, tsConfigResolver, project.compilerOptions.get());

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
    addSourceFilesForTsConfigResolverSync(project, tsConfigResolver, project.compilerOptions.get());

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
  });

  // get tsconfig info
  const tsConfigResolver = options.tsConfigFilePath == null
    ? undefined
    : new TsConfigResolver(
      fileSystemWrapper,
      fileSystemWrapper.getStandardizedAbsolutePath(options.tsConfigFilePath),
      new CompilerOptionsContainer().getEncoding(),
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
}

/** Project that holds source files. */
export class Project {
  readonly #sourceFileCache: SourceFileCache;
  /** Stands in for the compiler program; see createProgram. */
  #program: ts.Program | undefined;
  /** Stands in for the compiler project; see getLanguageService. */
  #languageService: ts.LanguageService | undefined;
  #moduleResolutionHost: ts.ModuleResolutionHost | undefined;
  readonly #fileSystemWrapper: TransactionalFileSystem;
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

    // initialize the source file cache, which owns the compiler session
    this.#sourceFileCache = new SourceFileCache(this.#fileSystemWrapper, this.compilerOptions, {
      libFolderPath: options.libFolderPath,
      skipLoadingLibFiles: options.skipLoadingLibFiles,
      resolutionHost: options.resolutionHost?.(() => this.compilerOptions.get()),
    });
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
  async addSourceFileAtPath(filePath: string, options?: SourceFileOptions): Promise<ts.SourceFile> {
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
  addSourceFileAtPathSync(filePath: string, options?: SourceFileOptions): ts.SourceFile {
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
  addSourceFileAtPathIfExists(filePath: string, options?: SourceFileOptions): Promise<ts.SourceFile | undefined> {
    return this.#sourceFileCache.addOrGetSourceFileFromFilePath(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath));
  }

  /**
   * Synchronously adds a source file from a file path if it exists or returns undefined.
   *
   * Will return the source file if it was already added.
   * @param filePath - File path to get the file from.
   * @param options - Options for adding the file.
   * @skipOrThrowCheck
   */
  addSourceFileAtPathIfExistsSync(filePath: string, options?: SourceFileOptions): ts.SourceFile | undefined {
    return this.#sourceFileCache.addOrGetSourceFileFromFilePathSync(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath));
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
    return addSourceFilesForTsConfigResolver(this, resolver, resolver.getCompilerOptions());
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
    return addSourceFilesForTsConfigResolverSync(this, resolver, resolver.getCompilerOptions());
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
    options?: SourceFileOptions,
  ): ts.SourceFile {
    return this.#sourceFileCache.createSourceFileFromText(
      this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath),
      sourceFileText || "",
    );
  }

  /**
   * Updates the source file stored in the project at the specified path.
   * @param filePath - File path of the source file.
   * @param sourceFileText - Text of the source file.
   * @param options - Options for updating the source file.
   */
  updateSourceFile(filePath: string, sourceFileText: string, options?: SourceFileOptions): ts.SourceFile;
  /**
   * Updates the source file stored in the project. The `fileName` of the source file object is used to tell which file to update.
   *
   * The file is re-created from the provided file's text rather than stored
   * as-is, so the returned file is a new object: the compiler owns parsing, and
   * a tree it did not produce cannot be put into a project.
   * @param newSourceFile - The new source file.
   */
  updateSourceFile(newSourceFile: ts.SourceFile): ts.SourceFile;
  updateSourceFile(filePathOrSourceFile: string | ts.SourceFile, sourceFileText?: string, options?: SourceFileOptions) {
    if (typeof filePathOrSourceFile === "string")
      return this.createSourceFile(filePathOrSourceFile, sourceFileText, options);

    return this.createSourceFile(filePathOrSourceFile.fileName, filePathOrSourceFile.text);
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
    const addedSourceFiles: ts.SourceFile[] = [];
    const seen = new Set<string>();
    let addedAny: boolean;

    // tsgo resolves modules, `/// <reference>`s and type directives inside the
    // compiler, and there is no host callback to report a file it loaded, so the
    // program is asked what it ended up with. Adding a file can pull in more, so
    // this repeats until the program stops growing.
    do {
      addedAny = false;
      for (const fileName of this.createProgram().getSourceFileNames()) {
        // the lib files live in the compiler's own bundle rather than on a file system
        if (isCompilerOwnedPath(fileName) || !seen.add(fileName))
          continue;
        const filePath = this.#fileSystemWrapper.getStandardizedAbsolutePath(fileName);
        if (this.#sourceFileCache.containsSourceFileAtPath(filePath))
          continue;
        const sourceFile = this.addSourceFileAtPathIfExistsSync(filePath);
        if (sourceFile != null) {
          addedSourceFiles.push(sourceFile);
          addedAny = true;
        }
      }
    } while (addedAny);

    return addedSourceFiles;
  }

  /**
   * Gets the program.
   *
   * Despite the name this does not create one. The compiler keeps a single
   * program per project and updates it as files change, so this returns that
   * program for the project's current state, and there is nothing to override
   * it with.
   */
  createProgram(): ts.Program {
    return this.#program ??= new Proxy({} as ts.Program, {
      get: (_target, property) => {
        // The registry opens the project against a tsconfig it writes itself, so
        // the compiler's own config diagnostics are about that synthetic file and
        // say nothing about the caller's. The ones from the caller's tsconfig were
        // read when the project was created, and are what belongs here.
        if (property === "getConfigFileParsingDiagnostics")
          return () => this.#configFileParsingDiagnostics;
        const program = this.#sourceFileCache.documentRegistry.program as unknown as Record<PropertyKey, unknown>;
        const value = program[property];
        return typeof value === "function" ? value.bind(program) : value;
      },
    });
  }

  /** Gets the diagnostics from parsing the project's tsconfig, if it had one. */
  getConfigFileParsingDiagnostics(): readonly ts.Diagnostic[] {
    return this.#configFileParsingDiagnostics;
  }

  /**
   * Gets the language service.
   *
   * The compiler has no language service of its own: formatting,
   * organize-imports, rename, definitions, implementations and code fixes are
   * methods on its project, so that is what this returns.
   *
   * The object handed back stands in for that project rather than being it. A
   * project belongs to one snapshot, and a new snapshot is taken every time a
   * file changes, so a caller holding the project itself would find it throwing
   * `snapshot N not found` after the next edit. This resolves the current one per
   * call, which is also what lets the same reference stay valid.
   */
  getLanguageService(): ts.LanguageService {
    return this.#languageService ??= new Proxy({} as ts.LanguageService, {
      get: (_target, property) => {
        const project = this.#sourceFileCache.documentRegistry.project as unknown as Record<PropertyKey, unknown>;
        const value = project[property];
        return typeof value === "function" ? value.bind(project) : value;
      },
    });
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
    const sourceFile = this.#getSourceFileInternal(fileNameOrSearchFunction);
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
  getSourceFile(fileNameOrSearchFunction: string | ((file: ts.SourceFile) => boolean)): ts.SourceFile | undefined {
    return this.#getSourceFileInternal(fileNameOrSearchFunction);
  }

  #getSourceFileInternal(fileNameOrSearchFunction: string | ((file: ts.SourceFile) => boolean)): ts.SourceFile | undefined {
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
   *
   * Despite the name there is neither colour nor context: the compiler has no
   * such formatter, so the diagnostics are formatted here, without the source
   * line, the caret or the ANSI colouring.
   * @param diagnostics - Diagnostics to get a string of.
   * @param options - Collection of options. For example, the new line character to use (defaults to the OS' new line character).
   */
  formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<ts.Diagnostic>, opts: { newLineChar?: "\n" | "\r\n" } = {}) {
    const newLineChar = opts.newLineChar ?? runtime.getEndOfLine();
    return diagnostics
      .map(diagnostic => {
        const category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
        const message = `${category} TS${diagnostic.code}: ${diagnostic.text}`;
        if (diagnostic.fileName == null)
          return message;
        const sourceFile = this.getSourceFile(diagnostic.fileName);
        if (sourceFile == null)
          return `${diagnostic.fileName}: ${message}`;
        const line = StringUtils.getLineNumberAtPos(sourceFile.text, diagnostic.pos);
        const column = StringUtils.getLengthFromLineStartAtPos(sourceFile.text, diagnostic.pos) + 1;
        return `${diagnostic.fileName}(${line},${column}): ${message}`;
      })
      .join(newLineChar);
  }

  /**
   * Gets a ts.ModuleResolutionHost for the project.
   */
  getModuleResolutionHost(): ts.ModuleResolutionHost {
    return this.#moduleResolutionHost ??= createModuleResolutionHost({
      transactionalFileSystem: this.#fileSystemWrapper,
      getEncoding: () => this.compilerOptions.getEncoding(),
      sourceFileContainer: {
        containsDirectoryAtPath: dirPath => this.#sourceFileCache.containsDirectoryAtPath(dirPath),
        containsSourceFileAtPath: filePath => this.#sourceFileCache.containsSourceFileAtPath(filePath),
        getSourceFileFromCacheFromFilePath: filePath => {
          const sourceFile = this.#sourceFileCache.getSourceFileFromCacheFromFilePath(filePath);
          return sourceFile == null ? undefined : { getFullText: () => sourceFile.text };
        },
        getChildDirectoriesOfDirectory: dirPath => this.#sourceFileCache.getChildDirectoriesOfDirectory(dirPath),
      },
    });
  }
}

async function addSourceFilesForTsConfigResolver(project: Project, tsConfigResolver: TsConfigResolver, compilerOptions: ts.CompilerOptions) {
  const sourceFiles: ts.SourceFile[] = [];
  await Promise.all(
    tsConfigResolver.getPaths(compilerOptions).filePaths
      .map(p => project.addSourceFileAtPath(p).then(s => sourceFiles.push(s))),
  );
  return sourceFiles;
}

function addSourceFilesForTsConfigResolverSync(project: Project, tsConfigResolver: TsConfigResolver, compilerOptions: ts.CompilerOptions) {
  return tsConfigResolver.getPaths(compilerOptions).filePaths.map(p => project.addSourceFileAtPathSync(p));
}
