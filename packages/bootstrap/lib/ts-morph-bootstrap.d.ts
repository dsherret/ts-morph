import { ts } from "@ts-morph/common";

/**
 * Holds the compiler options.
 */
export declare class CompilerOptionsContainer extends SettingsContainer<ts.CompilerOptions> {
    constructor();
    /**
     * Sets one or all of the compiler options.
     *
     * WARNING: Setting the compiler options will cause a complete reparse of all the source files.
     * @param settings - Compiler options to set.
     */
    set(settings: Partial<ts.CompilerOptions>): void;
    /**
     * Gets the encoding from the compiler options or returns utf-8.
     */
    getEncoding(): string;
}

/**
 * Represents a file system that can be interacted with.
 */
export interface FileSystemHost {
    /** Gets if this file system is case sensitive. */
    isCaseSensitive(): boolean;
    /** Asynchronously deletes the specified file or directory. */
    delete(path: string): Promise<void>;
    /** Synchronously deletes the specified file or directory */
    deleteSync(path: string): void;
    /**
     * Reads all the child directories and files.
     * @remarks Implementers should have this return the full file path.
     */
    readDirSync(dirPath: string): string[];
    /** Asynchronously reads a file at the specified path. */
    readFile(filePath: string, encoding?: string): Promise<string>;
    /** Synchronously reads a file at the specified path. */
    readFileSync(filePath: string, encoding?: string): string;
    /** Asynchronously writes a file to the file system. */
    writeFile(filePath: string, fileText: string): Promise<void>;
    /** Synchronously writes a file to the file system. */
    writeFileSync(filePath: string, fileText: string): void;
    /** Asynchronously creates a directory at the specified path. */
    mkdir(dirPath: string): Promise<void>;
    /** Synchronously creates a directory at the specified path. */
    mkdirSync(dirPath: string): void;
    /** Asynchronously moves a file or directory. */
    move(srcPath: string, destPath: string): Promise<void>;
    /** Synchronously moves a file or directory. */
    moveSync(srcPath: string, destPath: string): void;
    /** Asynchronously copies a file or directory. */
    copy(srcPath: string, destPath: string): Promise<void>;
    /** Synchronously copies a file or directory. */
    copySync(srcPath: string, destPath: string): void;
    /** Asynchronously checks if a file exists. */
    fileExists(filePath: string): Promise<boolean>;
    /** Synchronously checks if a file exists. */
    fileExistsSync(filePath: string): boolean;
    /** Asynchronously checks if a directory exists. */
    directoryExists(dirPath: string): Promise<boolean>;
    /** Synchronously checks if a directory exists. */
    directoryExistsSync(dirPath: string): boolean;
    /** See https://nodejs.org/api/fs.html#fs_fs_realpathsync_path_options */
    realpathSync(path: string): string;
    /** Gets the current directory of the environment. */
    getCurrentDirectory(): string;
    /** Uses pattern matching to find files or directories. */
    glob(patterns: ReadonlyArray<string>): Promise<string[]>;
    /** Synchronously uses pattern matching to find files or directories. */
    globSync(patterns: ReadonlyArray<string>): string[];
}

/**
 * Factory used to create a resolution host.
 * @remarks The compiler options are retrieved via a function in order to get the project's current compiler options.
 */
export declare type ResolutionHostFactory = (moduleResolutionHost: ts.ModuleResolutionHost, getCompilerOptions: () => ts.CompilerOptions) => ResolutionHost;

/** Host for implementing custom module and/or type reference directive resolution. */
export interface ResolutionHost {
    resolveModuleNames?: ts.LanguageServiceHost["resolveModuleNames"];
    getResolvedModuleWithFailedLookupLocationsFromCache?: ts.LanguageServiceHost["getResolvedModuleWithFailedLookupLocationsFromCache"];
    resolveTypeReferenceDirectives?: ts.LanguageServiceHost["resolveTypeReferenceDirectives"];
}

export declare abstract class SettingsContainer<T extends object> {
    protected _settings: T;
    /**
     * Constructor.
     * @param defaultSettings - The settings to use by default.
     */
    constructor(defaultSettings: T);
    /**
     * Resets the settings to the default.
     */
    reset(): void;
    /**
     * Gets a copy of the settings as an object.
     */
    get(): T;
    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<T>): void;
    /**
     * Subscribe to modifications in the settings container.
     * @param action - Action to execute when the settings change.
     */
    onModified(action: () => void): void;
}

export interface InMemoryFileSystemHostOptions {
    /**
     * Set this to true to not load the /node_modules/typescript/lib files on construction.
     * @default false
     */
    skipLoadingLibFiles?: boolean;
}

/** An implementation of a file system that exists in memory only. */
export declare class InMemoryFileSystemHost implements FileSystemHost {
    /**
     * Constructor.
     * @param options - Options for creating the file system.
     */
    constructor(options?: InMemoryFileSystemHostOptions);
    /** @inheritdoc */
    isCaseSensitive(): boolean;
    /** @inheritdoc */
    delete(path: string): Promise<void>;
    /** @inheritdoc */
    deleteSync(path: string): void;
    /** @inheritdoc */
    readDirSync(dirPath: string): string[];
    /** @inheritdoc */
    readFile(filePath: string, encoding?: string): Promise<string>;
    /** @inheritdoc */
    readFileSync(filePath: string, encoding?: string): string;
    /** @inheritdoc */
    writeFile(filePath: string, fileText: string): Promise<void>;
    /** @inheritdoc */
    writeFileSync(filePath: string, fileText: string): void;
    /** @inheritdoc */
    mkdir(dirPath: string): Promise<void>;
    /** @inheritdoc */
    mkdirSync(dirPath: string): void;
    /** @inheritdoc */
    move(srcPath: string, destPath: string): Promise<void>;
    /** @inheritdoc */
    moveSync(srcPath: string, destPath: string): void;
    /** @inheritdoc */
    copy(srcPath: string, destPath: string): Promise<void>;
    /** @inheritdoc */
    copySync(srcPath: string, destPath: string): void;
    /** @inheritdoc */
    fileExists(filePath: string): Promise<boolean>;
    /** @inheritdoc */
    fileExistsSync(filePath: string): boolean;
    /** @inheritdoc */
    directoryExists(dirPath: string): Promise<boolean>;
    /** @inheritdoc */
    directoryExistsSync(dirPath: string): boolean;
    /** @inheritdoc */
    realpathSync(path: string): string;
    /** @inheritdoc */
    getCurrentDirectory(): string;
    /** @inheritdoc */
    glob(patterns: ReadonlyArray<string>): Promise<string[]>;
    /** @inheritdoc */
    globSync(patterns: ReadonlyArray<string>): string[];
}

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
export declare class Project {
    /**
     * Initializes a new instance.
     * @param options - Optional options.
     */
    constructor(options?: ProjectOptions);
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
    addSourceFileAtPathIfExists(filePath: string, options?: {
        scriptKind?: ts.ScriptKind;
    }): ts.SourceFile | undefined;
    /**
     * Adds an existing source file from a file path or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the file.
     * @throws FileNotFoundError when the file is not found.
     */
    addSourceFileAtPath(filePath: string, options?: {
        scriptKind?: ts.ScriptKind;
    }): ts.SourceFile;
    /**
     * Adds source files based on file globs.
     * @param fileGlobs - File glob or globs to add files based on.
     * @returns The matched source files.
     */
    addSourceFilesByPaths(fileGlobs: string | ReadonlyArray<string>): ts.SourceFile[];
    /**
     * Adds all the source files from the specified tsconfig.json.
     *
     * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
     * addFilesFromTsConfig option to false.
     * @param tsConfigFilePath - File path to the tsconfig.json file.
     */
    addSourceFilesFromTsConfig(tsConfigFilePath: string): ts.SourceFile[];
    /**
     * Creates a source file at the specified file path with the specified text.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @param sourceFileText - Text to use for the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string, sourceFileText?: string, options?: {
        scriptKind?: ts.ScriptKind;
    }): ts.SourceFile;
    /**
     * Updates the source file stored in the project at the specified path.
     * @param filePath - File path of the source file.
     * @param sourceFileText - Text of the source file.
     * @param options - Options for updating the source file.
     */
    updateSourceFile(filePath: string, sourceFileText: string, options?: {
        scriptKind?: ts.ScriptKind;
    }): ts.SourceFile;
    /**
     * Updates the source file stored in the project. The `fileName` of the source file object is used to tell which file to update.
     * @param newSourceFile - The new source file.
     */
    updateSourceFile(newSourceFile: ts.SourceFile): ts.SourceFile;
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
    /**
     * Adds the source files the project's source files depend on to the project.
     * @remarks
     * * This should be done after source files are added to the project, preferably once to
     * avoid doing more work than necessary.
     * * This is done by default when creating a Project and providing a tsconfig.json and
     * not specifying to not add the source files.
     */
    resolveSourceFileDependencies(): void;
    /**
     * Creates a new program.
     * Note: You should get a new program any time source files are added, removed, or changed.
     */
    createProgram(options?: ts.CreateProgramOptions): ts.Program;
    /**
     * Gets the language service.
     */
    getLanguageService(): ts.LanguageService;
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
    /** Gets the source files in the project. */
    getSourceFiles(): ts.SourceFile[];
    /**
     * Formats an array of diagnostics with their color and context into a string.
     * @param diagnostics - Diagnostics to get a string of.
     * @param options - Collection of options. For example, the new line character to use (defaults to the OS' new line character).
     */
    formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<ts.Diagnostic>, opts?: {
        newLineChar?: "\n" | "\r\n";
    }): string;
    /**
     * Gets a ts.ModuleResolutionHost for the project.
     */
    getModuleResolutionHost(): ts.ModuleResolutionHost;
}

export { ts };
