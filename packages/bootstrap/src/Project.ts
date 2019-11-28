import { errors, FileSystemHost, TransactionalFileSystem, InMemoryFileSystemHost, RealFileSystemHost, ResolutionHostFactory, TsConfigResolver,
    CompilerOptionsContainer, Memoize, createModuleResolutionHost, createHosts, ts, FileUtils, StandardizedFilePath } from "@ts-morph/common";
import { SourceFileCache } from "./SourceFileCache";

/** Options for creating a project. */
export interface ProjectOptions {
    /** Compiler options */
    compilerOptions?: ts.CompilerOptions;
    /** File path to the tsconfig.json file. */
    tsConfigFilePath?: string;
    /** Whether to add the source files from the specified tsconfig.json or not. Defaults to true. */
    addFilesFromTsConfig?: boolean;
    /** Skip resolving file dependencies when providing a ts config file path and adding the files from tsconfig. */
    skipFileDependencyResolution?: boolean;
    /** Whether to use an in-memory file system. */
    useInMemoryFileSystem?: boolean;
    /** Skip loading the lib files when using an in-memory file system. @default false */
    skipLoadingLibFiles?: boolean;
    /**
     * Optional file system host. Useful for mocking access to the file system.
     * @remarks Consider using `useInMemoryFileSystem` instead.
     */
    fileSystem?: FileSystemHost;
    /** Creates a resolution host for specifying custom module and/or type reference directive resolution. */
    resolutionHost?: ResolutionHostFactory;
}

/** Project that holds source files. */
export class Project {
    /** @internal */
    private readonly _sourceFileCache: SourceFileCache;
    /** @internal */
    private readonly _fileSystemWrapper: TransactionalFileSystem;
    /** @internal */
    private readonly languageServiceHost: ts.LanguageServiceHost;
    /** @internal */
    private readonly compilerHost: ts.CompilerHost;

    /**
     * Initializes a new instance.
     * @param options - Optional options.
     */
    constructor(options: ProjectOptions = {}) {
        verifyOptions();

        this.fileSystem = getFileSystem();
        this._fileSystemWrapper = new TransactionalFileSystem(this.fileSystem);

        // get tsconfig info
        const tsConfigResolver = options.tsConfigFilePath == null
            ? undefined
            : new TsConfigResolver(
                this._fileSystemWrapper,
                this._fileSystemWrapper.getStandardizedAbsolutePath(options.tsConfigFilePath),
                getEncodingFromProvidedOptions()
            );

        // initialize the compiler options
        const tsCompilerOptions = getCompilerOptions();
        this.compilerOptions = new CompilerOptionsContainer();
        this.compilerOptions.set(tsCompilerOptions);

        // initialize the source file cache
        this._sourceFileCache = new SourceFileCache(this._fileSystemWrapper, this.compilerOptions);

        // initialize the compiler resolution host
        const resolutionHost = !options.resolutionHost
            ? undefined
            : options.resolutionHost(this.getModuleResolutionHost(), () => this.compilerOptions.get());

        // setup context
        const newLineKind = "\n";
        const { languageServiceHost, compilerHost } = createHosts({
            transactionalFileSystem: this._fileSystemWrapper,
            sourceFileContainer: this._sourceFileCache,
            compilerOptions: this.compilerOptions,
            getNewLine: () => newLineKind,
            resolutionHost: resolutionHost || {}
        });
        this.languageServiceHost = languageServiceHost;
        this.compilerHost = compilerHost;

        // add any file paths from the tsconfig if necessary
        if (tsConfigResolver != null && options.addFilesFromTsConfig !== false) {
            this._addSourceFilesForTsConfigResolver(tsConfigResolver, tsCompilerOptions);

            if (!options.skipFileDependencyResolution)
                this.resolveSourceFileDependencies();
        }

        function verifyOptions() {
            if (options.fileSystem != null && options.useInMemoryFileSystem)
                throw new errors.InvalidOperationError("Cannot provide a file system when specifying to use an in-memory file system.");
            if (options.skipLoadingLibFiles && !options.useInMemoryFileSystem) {
                throw new errors.InvalidOperationError(
                    `The ${nameof(options.skipLoadingLibFiles)} option can only be true when ${nameof(options.useInMemoryFileSystem)} is true.`
                );
            }
        }

        function getFileSystem() {
            if (options.useInMemoryFileSystem)
                return new InMemoryFileSystemHost({ skipLoadingLibFiles: options.skipLoadingLibFiles });
            return options.fileSystem ?? new RealFileSystemHost();
        }

        function getCompilerOptions(): ts.CompilerOptions {
            return {
                ...getTsConfigCompilerOptions(),
                ...(options.compilerOptions || {}) as ts.CompilerOptions
            };
        }

        function getTsConfigCompilerOptions() {
            if (tsConfigResolver == null)
                return {};
            return tsConfigResolver.getCompilerOptions();
        }

        function getEncodingFromProvidedOptions() {
            const defaultEncoding = "utf-8";
            if (options.compilerOptions != null)
                return options.compilerOptions.charset || defaultEncoding;
            return defaultEncoding;
        }
    }

    /** Gets the compiler options for modification. */
    readonly compilerOptions: CompilerOptionsContainer;

    /** Gets the file system host used for this project. */
    readonly fileSystem: FileSystemHost;

    /**
     * Adds a source file from a file path if it exists or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the file.
     * @skipOrThrowCheck
     */
    addSourceFileAtPathIfExists(filePath: string, options?: { scriptKind?: ts.ScriptKind; }): ts.SourceFile | undefined {
        return this._sourceFileCache.addOrGetSourceFileFromFilePath(this._fileSystemWrapper.getStandardizedAbsolutePath(filePath), {
            scriptKind: options && options.scriptKind
        });
    }

    /**
     * Adds an existing source file from a file path or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the file.
     * @throws FileNotFoundError when the file is not found.
     */
    addSourceFileAtPath(filePath: string, options?: { scriptKind?: ts.ScriptKind; }): ts.SourceFile {
        const sourceFile = this.addSourceFileAtPathIfExists(filePath, options);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(this._fileSystemWrapper.getStandardizedAbsolutePath(filePath));
        return sourceFile;
    }

    /**
     * Adds source files based on file globs.
     * @param fileGlobs - File glob or globs to add files based on.
     * @returns The matched source files.
     */
    addSourceFilesByPaths(fileGlobs: string | ReadonlyArray<string>): ts.SourceFile[] {
        if (typeof fileGlobs === "string")
            fileGlobs = [fileGlobs];

        const sourceFiles: ts.SourceFile[] = [];

        for (const filePath of this._fileSystemWrapper.globSync(fileGlobs)) {
            const sourceFile = this.addSourceFileAtPathIfExists(filePath);
            if (sourceFile != null)
                sourceFiles.push(sourceFile);
        }

        return sourceFiles;
    }

    /**
     * Adds all the source files from the specified tsconfig.json.
     *
     * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
     * addFilesFromTsConfig option to false.
     * @param tsConfigFilePath - File path to the tsconfig.json file.
     */
    addSourceFilesFromTsConfig(tsConfigFilePath: string): ts.SourceFile[] {
        const standardizedFilePath = this._fileSystemWrapper.getStandardizedAbsolutePath(tsConfigFilePath);
        const resolver = new TsConfigResolver(this._fileSystemWrapper, standardizedFilePath, this.compilerOptions.getEncoding());
        return this._addSourceFilesForTsConfigResolver(resolver, resolver.getCompilerOptions());
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
        options?: { scriptKind?: ts.ScriptKind; }
    ): ts.SourceFile {
        return this._sourceFileCache.createSourceFileFromText(
            this._fileSystemWrapper.getStandardizedAbsolutePath(filePath),
            sourceFileText || "",
            { scriptKind: options && options.scriptKind }
        );
    }

    /**
     * Updates the source file stored in the project at the specified path.
     * @param filePath - File path of the source file.
     * @param sourceFileText - Text of the source file.
     * @param options - Options for updating the source file.
     */
    updateSourceFile(filePath: string, sourceFileText: string, options?: { scriptKind?: ts.ScriptKind; }): ts.SourceFile;
    /**
     * Updates the source file stored in the project. The `fileName` of the source file object is used to tell which file to update.
     * @param newSourceFile - The new source file.
     */
    updateSourceFile(newSourceFile: ts.SourceFile): ts.SourceFile;
    updateSourceFile(filePathOrSourceFile: string | ts.SourceFile, sourceFileText?: string, options?: { scriptKind?: ts.ScriptKind; }) {
        if (typeof filePathOrSourceFile === "string")
            return this.createSourceFile(filePathOrSourceFile, sourceFileText, options);

        // ensure this has the language service properties set
        incrementVersion(filePathOrSourceFile);
        ensureScriptSnapshot(filePathOrSourceFile);

        return this._sourceFileCache.setSourceFile(filePathOrSourceFile);

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
        this._sourceFileCache.removeSourceFile(this._fileSystemWrapper.getStandardizedAbsolutePath(
            typeof filePathOrSourceFile === "string" ? filePathOrSourceFile : filePathOrSourceFile.fileName
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
    private _addSourceFilesForTsConfigResolver(tsConfigResolver: TsConfigResolver, compilerOptions: ts.CompilerOptions) {
        const paths = tsConfigResolver.getPaths(compilerOptions);

        const addedSourceFiles = paths.filePaths.map(p => this.addSourceFileAtPath(p));
        return addedSourceFiles;
    }

    /** @internal */
    private _oldProgram: ts.Program | undefined;

    /**
     * Creates a new program.
     * Note: You should get a new program any time source files are added, removed, or changed.
     */
    createProgram(options?: ts.CreateProgramOptions): ts.Program {
        const oldProgram = this._oldProgram;
        const program = ts.createProgram({
            rootNames: Array.from(this._sourceFileCache.getSourceFilePaths()),
            options: this.compilerOptions.get(),
            host: this.compilerHost,
            oldProgram,
            ...options
        });
        this._oldProgram = program;
        return program;
    }

    /**
     * Gets the language service.
     */
    @Memoize
    getLanguageService(): ts.LanguageService {
        return ts.createLanguageService(this.languageServiceHost, this._sourceFileCache.documentRegistry);
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
                const errorFileNameOrPath = this._fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
                throw new errors.InvalidOperationError(`Could not find source file in project at the provided path: ${errorFileNameOrPath}`);
            }
            else {
                throw new errors.InvalidOperationError(`Could not find source file in project with the provided file name: ${fileNameOrSearchFunction}`);
            }
        }
        else {
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
        const filePathOrSearchFunction = getFilePathOrSearchFunction(this._fileSystemWrapper);

        if (isStandardizedFilePath(filePathOrSearchFunction)) {
            // when a file path is specified, return even source files not in the project
            return this._sourceFileCache.getSourceFileFromCacheFromFilePath(filePathOrSearchFunction);
        }

        const allSoureFilesIterable = this.getSourceFiles();
        return selectSmallestDirPathResult(function*() {
            for (const sourceFile of allSoureFilesIterable) {
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
        return Array.from(this._sourceFileCache.getSourceFiles());
    }

    /**
     * Formats an array of diagnostics with their color and context into a string.
     * @param diagnostics - Diagnostics to get a string of.
     * @param options - Collection of options. For example, the new line character to use (defaults to the OS' new line character).
     */
    formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<ts.Diagnostic>, opts: { newLineChar?: "\n" | "\r\n"; } = {}) {
        return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => this._fileSystemWrapper.getCurrentDirectory(),
            getCanonicalFileName: fileName => fileName,
            getNewLine: () => opts.newLineChar || require("os").EOL
        });
    }

    /**
     * Gets a ts.ModuleResolutionHost for the project.
     */
    @Memoize
    getModuleResolutionHost(): ts.ModuleResolutionHost {
        return createModuleResolutionHost({
            transactionalFileSystem: this._fileSystemWrapper,
            getEncoding: () => this.compilerOptions.getEncoding(),
            sourceFileContainer: this._sourceFileCache
        });
    }
}
