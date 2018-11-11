import { CodeBlockWriter } from "./codeBlockWriter";
import { Diagnostic, EmitOptions, EmitResult, LanguageService, Node, Program, SourceFile, TypeChecker, FileTextChanges } from "./compiler";
import * as errors from "./errors";
import { DefaultFileSystemHost, Directory, DirectoryAddOptions, FileSystemHost, FileSystemWrapper, VirtualFileSystemHost } from "./fileSystem";
import { ProjectContext } from "./ProjectContext";
import { CompilerOptionsContainer, ManipulationSettings, ManipulationSettingsContainer } from "./options";
import { SourceFileStructure } from "./structures";
import { ts, CompilerOptions } from "./typescript";
import { ArrayUtils, FileUtils, matchGlobs, TsConfigResolver } from "./utils";

export interface Options {
    /** Compiler options */
    compilerOptions?: CompilerOptions;
    /** File path to the tsconfig.json file */
    tsConfigFilePath?: string;
    /** Whether to add the source files from the specified tsconfig.json or not. Defaults to true. */
    addFilesFromTsConfig?: boolean;
    /** Manipulation settings */
    manipulationSettings?: Partial<ManipulationSettings>;
    /** Whether to use a virtual file system. */
    useVirtualFileSystem?: boolean;
}

export interface SourceFileCreateOptions {
    overwrite?: boolean;
}

/**
 * Project that holds source files.
 */
export class Project {
    /** @internal */
    private readonly _context: ProjectContext;

    /**
     * Initializes a new instance.
     * @param options - Optional options.
     * @param fileSystem - Optional file system host. Useful for mocking access to the file system.
     */
    constructor(options: Options = {}, fileSystem?: FileSystemHost) {
        // setup file system
        if (fileSystem != null && options.useVirtualFileSystem)
            throw new errors.InvalidOperationError("Cannot provide a file system when specifying to use a virtual file system.");
        else if (options.useVirtualFileSystem)
            fileSystem = new VirtualFileSystemHost();
        else if (fileSystem == null)
            fileSystem = new DefaultFileSystemHost();
        const fileSystemWrapper = new FileSystemWrapper(fileSystem);

        // get tsconfig info
        const tsConfigResolver = options.tsConfigFilePath == null ? undefined : new TsConfigResolver(fileSystemWrapper, options.tsConfigFilePath, getEncoding());
        const compilerOptions = getCompilerOptions();

        // setup context
        this._context = new ProjectContext(fileSystemWrapper, compilerOptions, { createLanguageService: true });

        // initialize manipulation settings
        if (options.manipulationSettings != null)
            this._context.manipulationSettings.set(options.manipulationSettings);

        // add any file paths from the tsconfig if necessary
        if (tsConfigResolver != null && options.addFilesFromTsConfig !== false)
            this._addSourceFilesForTsConfigResolver(tsConfigResolver, compilerOptions);

        function getCompilerOptions(): CompilerOptions {
            return {
                ...getTsConfigCompilerOptions(),
                ...(options.compilerOptions || {}) as CompilerOptions
            };
        }

        function getTsConfigCompilerOptions() {
            if (tsConfigResolver == null)
                return {};
            return tsConfigResolver.getCompilerOptions();
        }

        function getEncoding() {
            const defaultEncoding = "utf-8";
            if (options.compilerOptions != null)
                return options.compilerOptions.charset || defaultEncoding;
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
     * Adds an existing directory from the path or returns undefined if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Path to add the directory at.
     * @param options - Options.
     * @skipOrThrowCheck
     */
    addExistingDirectoryIfExists(dirPath: string, options: DirectoryAddOptions = {}): Directory | undefined {
        dirPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        return this._context.directoryCoordinator.addExistingDirectoryIfExists(dirPath, options);
    }

    /**
     * Adds an existing directory from the path or throws if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Path to add the directory at.
     * @param options - Options.
     * @throws DirectoryNotFoundError when the directory does not exist.
     */
    addExistingDirectory(dirPath: string, options: DirectoryAddOptions = {}): Directory {
        dirPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        return this._context.directoryCoordinator.addExistingDirectory(dirPath, options);
    }

    /**
     * Creates a directory at the specified path.
     * @param dirPath - Path to create the directory at.
     */
    createDirectory(dirPath: string): Directory {
        dirPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        return this._context.directoryCoordinator.createDirectoryOrAddIfExists(dirPath);
    }

    /**
     * Gets a directory by the specified path or throws if it doesn't exist.
     * @param dirPath - Path to create the directory at.
     */
    getDirectoryOrThrow(dirPath: string): Directory {
        return errors.throwIfNullOrUndefined(this.getDirectory(dirPath),
            () => `Could not find a directory at the specified path: ${this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath)}`);
    }

    /**
     * Gets a directory by the specified path or returns undefined if it doesn't exist.
     * @param dirPath - Directory path.
     */
    getDirectory(dirPath: string): Directory | undefined {
        dirPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        return this._context.compilerFactory.getDirectoryFromCache(dirPath);
    }

    /**
     * Gets all the directories.
     */
    getDirectories() {
        return ArrayUtils.from(this._context.compilerFactory.getDirectoriesByDepth());
    }

    /**
     * Gets the directories without a parent.
     */
    getRootDirectories() {
        return this._context.compilerFactory.getOrphanDirectories();
    }

    /**
     * Add source files based on file globs.
     * @param fileGlobs - File glob or globs to add files based on.
     * @returns The matched source files.
     */
    addExistingSourceFiles(fileGlobs: string | ReadonlyArray<string>): SourceFile[] {
        if (typeof fileGlobs === "string")
            fileGlobs = [fileGlobs];

        const sourceFiles: SourceFile[] = [];
        const globbedDirectories = FileUtils.getParentMostPaths(fileGlobs.filter(g => !FileUtils.isNegatedGlob(g)).map(g => FileUtils.getGlobDir(g)));

        for (const filePath of this._context.fileSystemWrapper.glob(fileGlobs)) {
            const sourceFile = this.addExistingSourceFileIfExists(filePath);
            if (sourceFile != null)
                sourceFiles.push(sourceFile);
        }

        for (const dirPath of globbedDirectories)
            this.addExistingDirectoryIfExists(dirPath, { recursive: true });

        return sourceFiles;
    }

    /**
     * Adds a source file from a file path if it exists or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @skipOrThrowCheck
     */
    addExistingSourceFileIfExists(filePath: string): SourceFile | undefined {
        return this._context.directoryCoordinator.addExistingSourceFileIfExists(filePath);
    }

    /**
     * Adds an existing source file from a file path or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @throws FileNotFoundError when the file is not found.
     */
    addExistingSourceFile(filePath: string): SourceFile {
        return this._context.directoryCoordinator.addExistingSourceFile(filePath);
    }

    /**
     * Adds all the source files from the specified tsconfig.json.
     *
     * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
     * addFilesFromTsConfig option to false.
     * @param tsConfigFilePath - File path to the tsconfig.json file.
     */
    addSourceFilesFromTsConfig(tsConfigFilePath: string): SourceFile[] {
        tsConfigFilePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(tsConfigFilePath);
        const resolver = new TsConfigResolver(this._context.fileSystemWrapper, tsConfigFilePath, this._context.getEncoding());
        return this._addSourceFilesForTsConfigResolver(resolver, resolver.getCompilerOptions());
    }

    /** @internal */
    private _addSourceFilesForTsConfigResolver(tsConfigResolver: TsConfigResolver, compilerOptions: CompilerOptions) {
        const paths = tsConfigResolver.getPaths(compilerOptions);

        const addedSourceFiles = paths.filePaths.map(p => this.addExistingSourceFile(p));
        for (const dirPath of paths.directoryPaths)
            this.addExistingDirectoryIfExists(dirPath);
        return addedSourceFiles;
    }

    /**
     * Creates a source file at the specified file path.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string): SourceFile;
    /**
     * Creates a source file at the specified file path with the specified text.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @param sourceFileText - Text of the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string, sourceFileText: string, options?: SourceFileCreateOptions): SourceFile;
    /**
     * Creates a source file at the specified file path with the specified text.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @param structure - Structure that represents the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string, structure: SourceFileStructure, options?: SourceFileCreateOptions): SourceFile;
    createSourceFile(filePath: string, structureOrText?: SourceFileStructure | string, options?: SourceFileCreateOptions): SourceFile {
        return this._context.compilerFactory.createSourceFile(filePath, structureOrText || "", options || {});
    }

    /**
     * Removes a source file from the AST.
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
     * Gets a source file by a search function. Throws an erorr if it doesn't exist.
     * @param searchFunction - Search function.
     */
    getSourceFileOrThrow(searchFunction: (file: SourceFile) => boolean): SourceFile;
    getSourceFileOrThrow(fileNameOrSearchFunction: string | ((file: SourceFile) => boolean)): SourceFile {
        const sourceFile = this.getSourceFile(fileNameOrSearchFunction);
        if (sourceFile == null) {
            if (typeof fileNameOrSearchFunction === "string")
                throw new errors.InvalidOperationError(`Could not find source file based on the provided name or path: ${fileNameOrSearchFunction}`);
            else
                throw new errors.InvalidOperationError(`Could not find source file based on the provided condition.`);
        }
        return sourceFile;
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

        if (typeof filePathOrSearchFunction === "string")
            return this._context.compilerFactory.getSourceFileFromCacheFromFilePath(filePathOrSearchFunction);
        return ArrayUtils.find(this._context.compilerFactory.getSourceFilesByDirectoryDepth(), filePathOrSearchFunction);

        function getFilePathOrSearchFunction(fileSystemWrapper: FileSystemWrapper): string | ((file: SourceFile) => boolean) {
            if (fileNameOrSearchFunction instanceof Function)
                return fileNameOrSearchFunction;

            const fileNameOrPath = FileUtils.standardizeSlashes(fileNameOrSearchFunction);
            if (FileUtils.pathIsAbsolute(fileNameOrPath) || fileNameOrPath.indexOf("/") >= 0)
                return fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
            else
                return def => FileUtils.pathEndsWith(def.getFilePath(), fileNameOrPath);
        }
    }

    /**
     * Gets all the source files contained in the compiler wrapper.
     * @param globPattern - Glob pattern for filtering out the source files.
     */
    getSourceFiles(): SourceFile[];
    /**
     * Gets all the source files contained in the compiler wrapper that match a pattern.
     * @param globPattern - Glob pattern for filtering out the source files.
     */
    getSourceFiles(globPattern: string): SourceFile[];
    /**
     * Gets all the source files contained in the compiler wrapper that match the passed in patterns.
     * @param globPatterns - Glob patterns for filtering out the source files.
     */
    getSourceFiles(globPatterns: ReadonlyArray<string>): SourceFile[];
    getSourceFiles(globPatterns?: string | ReadonlyArray<string>): SourceFile[] {
        const { compilerFactory, fileSystemWrapper } = this._context;
        const sourceFiles = this._context.compilerFactory.getSourceFilesByDirectoryDepth();

        if (typeof globPatterns === "string" || globPatterns instanceof Array)
            return ArrayUtils.from(getFilteredSourceFiles());
        else
            return ArrayUtils.from(sourceFiles);

        function* getFilteredSourceFiles() {
            const sourceFilePaths = Array.from(getSourceFilePaths());
            const matchedPaths = matchGlobs(sourceFilePaths, globPatterns!, fileSystemWrapper.getCurrentDirectory());

            for (const matchedPath of matchedPaths)
                yield compilerFactory.getSourceFileFromCacheFromFilePath(matchedPath)!;

            function* getSourceFilePaths() {
                for (const sourceFile of sourceFiles)
                    yield sourceFile.getFilePath();
            }
        }
    }

    /**
     * Gets the specified ambient module symbol or returns undefined if not found.
     * @param moduleName - The ambient module name with or without quotes.
     */
    getAmbientModule(moduleName: string) {
        moduleName = normalizeAmbientModuleName(moduleName);
        return ArrayUtils.find(this.getAmbientModules(), s => s.getName() === moduleName);
    }

    /**
     * Gets the specified ambient module symbol or throws if not found.
     * @param moduleName - The ambient module name with or without quotes.
     */
    getAmbientModuleOrThrow(moduleName: string) {
        return errors.throwIfNullOrUndefined(this.getAmbientModule(moduleName),
            () => `Could not find ambient module with name: ${normalizeAmbientModuleName(moduleName)}`);
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

    private _getUnsavedSourceFiles() {
        return ArrayUtils.from(getUnsavedIterator(this._context.compilerFactory.getSourceFilesByDirectoryDepth()));

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
     * Emits all the source files.
     * @param emitOptions - Optional emit options.
     */
    emit(emitOptions: EmitOptions = {}): EmitResult {
        return this._context.program.emit(emitOptions);
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
     * @param block - Block of code to run.
     */
    forgetNodesCreatedInBlock(block: (remember: (...node: Node[]) => void) => void): void;
    /**
     * Forgets the nodes created in the scope of the passed in block asynchronously.
     *
     * This is an advanced method that can be used to easily "forget" all the nodes created within the scope of the block.
     * @param block - Block of code to run.
     */
    forgetNodesCreatedInBlock(block: (remember: (...node: Node[]) => void) => Promise<void>): void;
    forgetNodesCreatedInBlock(block: (remember: (...node: Node[]) => void) => (void | Promise<void>)) {
        return this._context.compilerFactory.forgetNodesCreatedInBlock(block);
    }

    /**
     * Formats an array of diagnostics with their color and context into a string.
     * @param diagnostics - Diagnostics to get a string of.
     * @param options - Collection of options. For exmaple, the new line character to use (defaults to the OS' new line character).
     */
    formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<Diagnostic>, opts: { newLineChar?: "\n" | "\r\n"; } = {}) {
        return ts.formatDiagnosticsWithColorAndContext(diagnostics.map(d => d.compilerObject), {
            getCurrentDirectory: () => this._context.fileSystemWrapper.getCurrentDirectory(),
            getCanonicalFileName: fileName => fileName,
            getNewLine: () => opts.newLineChar || require("os").EOL
        });
    }

    /**
     * Apply given file text changes to this project, modifying and possibly creating new SourceFiles.
     *
     * WARNING: Internally it uses `SourceFile.applyTextChanges()` so this will forget any previously navigated descendant nodes of changed files.
     * @param fileTextChanges description of the changes to files to apply to this project.
     */
    applyFileTextChanges(fileTextChanges: FileTextChanges[]) {
        fileTextChanges.forEach(fileTextChange => {
            let file: SourceFile | undefined = this.getSourceFile(fileTextChange.getFilePath());
            errors.throwIfTrue(fileTextChange.isNewFile() && !!file, "FileTextChanges instructed to create file " + fileTextChange.getFilePath() +
                " but it already exists on the project. Aborting.");
            errors.throwIfTrue(!file && !fileTextChange.isNewFile(), "FileTextChanges instructed to modify existing file " + fileTextChange.getFilePath() +
                " but it doesn\'t exist. Refusing to create it. Aborting.");
            if (!file)
                file = this.createSourceFile(fileTextChange.getFilePath());
            file.applyTextChanges(fileTextChange.getTextChanges());
        });
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
