import { RuntimeDirEntry, ts } from "@ts-morph/common";

/**
 * Holds the compiler options.
 */
export declare class CompilerOptionsContainer extends SettingsContainer<ts.CompilerOptions> {
    constructor(defaultSettings?: ts.CompilerOptions);
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
    readDirSync(dirPath: string): RuntimeDirEntry[];
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
    /** Asynchronously checks if a file exists.
     * @remarks Implementers should throw an `errors.FileNotFoundError` when it does not exist.
     */
    fileExists(filePath: string): Promise<boolean>;
    /** Synchronously checks if a file exists.
     * @remarks Implementers should throw an `errors.FileNotFoundError` when it does not exist.
     */
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

/** An implementation of a file system that exists in memory only. */
export declare class InMemoryFileSystemHost implements FileSystemHost {
    #private;
    /**
     * Constructor.
     */
    constructor();
    /** @inheritdoc */
    isCaseSensitive(): boolean;
    /** @inheritdoc */
    delete(path: string): Promise<void>;
    /** @inheritdoc */
    deleteSync(path: string): void;
    /** @inheritdoc */
    readDirSync(dirPath: string): RuntimeDirEntry[];
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

/**
 * How a host answers.
 *
 * Returning nothing declines the question and leaves the specifier to the
 * compiler, so a host that only handles some specifiers says nothing about the
 * rest.
 */
export type ModuleResolutionAnswer = 
/** Resolve to this file. */
{
    resolvedFileName: string;
}
/** Resolve to nothing, and do not let the compiler try. */
 | {
    resolvedFileName: null;
}
/** Resolve this specifier instead, using the compiler's own rules. */
 | {
    moduleName: string;
} | undefined;

/** What a host is told about a specifier it is asked to resolve. */
export interface ModuleResolutionRequest {
    /** The specifier as written, e.g. `./mod.ts` or `lodash`. */
    moduleName: string;
    /** The file the specifier was written in. */
    containingFile: string;
    /**
     * How the containing file imports, when the compiler has an opinion.
     *
     * `ModuleKind.CommonJS` or `ModuleKind.ESNext`, so a host can resolve one
     * specifier differently for an ESM and a CommonJS importer. This is per import
     * rather than per file, which is finer than the `typescript` package's
     * `resolveModuleNames` gave a host.
     */
    resolutionMode: ts.ModuleKind | undefined;
}

/** Resolves module specifiers in place of the compiler. */
export interface ResolutionHost {
    resolveModuleName?(request: ModuleResolutionRequest): ModuleResolutionAnswer;
}

/**
 * Creates a resolution host for a project.
 *
 * The compiler options are given as a function because a project's options can
 * change after it is created, and a host that reads them wants the current ones.
 */
export type ResolutionHostFactory = (getCompilerOptions: () => ts.CompilerOptions) => ResolutionHost;

/**
 * Ready-made resolution hosts.
 *
 * `deno` is for Deno-style code, which writes the extension node omits. It
 * rewrites rather than resolves: dropping `.ts` says where to look, and the
 * compiler still decides how.
 */
export declare const ResolutionHosts: {
    deno: () => ResolutionHost;
};

export declare abstract class SettingsContainer<T extends object> {
    #private;
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

/**
 * Asynchronously creates a new collection of source files to analyze.
 * @param options Options for creating the project.
 */
export declare function createProject(options?: ProjectOptions): Promise<Project>;

/**
 * Synchronously creates a new collection of source files to analyze.
 * @param options Options for creating the project.
 */
export declare function createProjectSync(options?: ProjectOptions): Project;

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

/** Project that holds source files. */
export declare class Project {
    #private;
    private constructor();
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
    addSourceFileAtPath(filePath: string, options?: SourceFileOptions): Promise<ts.SourceFile>;
    /**
     * Synchronously adds an existing source file from a file path or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the file.
     * @throws FileNotFoundError when the file is not found.
     */
    addSourceFileAtPathSync(filePath: string, options?: SourceFileOptions): ts.SourceFile;
    /**
     * Asynchronously adds a source file from a file path if it exists or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the file.
     * @skipOrThrowCheck
     */
    addSourceFileAtPathIfExists(filePath: string, options?: SourceFileOptions): Promise<ts.SourceFile | undefined>;
    /**
     * Synchronously adds a source file from a file path if it exists or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the file.
     * @skipOrThrowCheck
     */
    addSourceFileAtPathIfExistsSync(filePath: string, options?: SourceFileOptions): ts.SourceFile | undefined;
    /**
     * Asynchronously adds source files based on file globs.
     * @param fileGlobs - File glob or globs to add files based on.
     * @returns The matched source files.
     */
    addSourceFilesByPaths(fileGlobs: string | ReadonlyArray<string>): Promise<ts.SourceFile[]>;
    /**
     * Synchronously adds source files based on file globs.
     * @param fileGlobs - File glob or globs to add files based on.
     * @returns The matched source files.
     * @remarks This is much slower than the asynchronous version.
     */
    addSourceFilesByPathsSync(fileGlobs: string | ReadonlyArray<string>): ts.SourceFile[];
    /**
     * Asynchronously adds all the source files from the specified tsconfig.json.
     *
     * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
     * `skipAddingSourceFilesFromTsConfig` option to `true`.
     * @param tsConfigFilePath - File path to the tsconfig.json file.
     */
    addSourceFilesFromTsConfig(tsConfigFilePath: string): Promise<ts.SourceFile[]>;
    /**
     * Synchronously adds all the source files from the specified tsconfig.json.
     *
     * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
     * `skipAddingSourceFilesFromTsConfig` option to `true`.
     * @param tsConfigFilePath - File path to the tsconfig.json file.
     */
    addSourceFilesFromTsConfigSync(tsConfigFilePath: string): ts.SourceFile[];
    /**
     * Creates a source file at the specified file path with the specified text.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @param sourceFileText - Text to use for the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string, sourceFileText?: string, options?: SourceFileOptions): ts.SourceFile;
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
    resolveSourceFileDependencies(): ts.SourceFile[];
    /**
     * Gets the program.
     *
     * Despite the name this does not create one. The compiler keeps a single
     * program per project and updates it as files change, so this returns that
     * program for the project's current state, and there is nothing to override
     * it with.
     */
    createProgram(): ts.Program;
    /** Gets the diagnostics from parsing the project's tsconfig, if it had one. */
    getConfigFileParsingDiagnostics(): readonly ts.Diagnostic[];
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
     *
     * Despite the name there is neither colour nor context: the compiler has no
     * such formatter, so the diagnostics are formatted here, without the source
     * line, the caret or the ANSI colouring.
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
