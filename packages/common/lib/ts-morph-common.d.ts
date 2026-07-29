import { ts } from "./typescript";
type SourceFile = ts.SourceFile;
type Node = ts.Node;
type Diagnostic = ts.Diagnostic;
import ModuleResolutionHost = ts.ModuleResolutionHost;
type Program = ts.Program;
type TypeChecker = ts.TypeChecker;
import type { FileSystem } from "./tsgo/api/fs";
import type { ModuleNameResolver } from "./tsgo/api/options";
import type { API, Project } from "./tsgo/api/sync/api";

export interface CompilerOptionsFromTsConfigOptions {
    encoding?: string;
    fileSystem?: FileSystemHost;
}

export interface CompilerOptionsFromTsConfigResult {
    options: ts.CompilerOptions;
    errors: ts.Diagnostic[];
}

/**
 * Gets the compiler options from a specified tsconfig.json
 * @param filePath - File path to the tsconfig.json.
 * @param options - Options.
 */
export declare function getCompilerOptionsFromTsConfig(filePath: string, options?: CompilerOptionsFromTsConfigOptions): CompilerOptionsFromTsConfigResult;

export declare class TsConfigResolver {
    #private;
    constructor(fileSystem: TransactionalFileSystem, tsConfigFilePath: StandardizedFilePath, encoding: string);
    getCompilerOptions(): ts.CompilerOptions;
    /** Gets the diagnostics from parsing the tsconfig. */
    getErrors(): ts.Diagnostic[];
    getPaths(compilerOptions?: ts.CompilerOptions): {
        filePaths: StandardizedFilePath[];
        directoryPaths: StandardizedFilePath[];
    };
    /**
     * Parses the tsconfig through tsgo, which reads the project's files through the
     * adapted file system so it sees the same state ts-morph does.
     */
    private _parseJsonConfigFileContent;
}

/**
 * Helper around a Map.
 * @remarks The use of this class is historical as it served as an abstraction around an ES5 based map and ES6, if available. Eventually
 * this class should be removed in favour of helper functions around a Map.
 */
export declare class KeyValueCache<T, U> {
    #private;
    getSize(): number;
    getValues(): MapIterator<U>;
    getValuesAsArray(): U[];
    getKeys(): MapIterator<T>;
    getEntries(): MapIterator<[T, U]>;
    getOrCreate<TCreate extends U = U>(key: T, createFunc: () => TCreate): TCreate;
    has(key: T): boolean;
    get(key: T): U | undefined;
    set(key: T, value: U): void;
    replaceKey(key: T, newKey: T): void;
    removeByKey(key: T): void;
    clear(): void;
}

/**
 * An array where the values are sorted by a key of one of the values.
 */
export declare class SortedKeyValueArray<TKey, TValue> {
    #private;
    constructor(getKey: (value: TValue) => TKey, comparer: Comparer<TKey>);
    set(value: TValue): void;
    removeByValue(value: TValue): void;
    removeByKey(key: TKey): void;
    getArrayCopy(): TValue[];
    hasItems(): boolean;
    entries(): Generator<TValue, void, unknown>;
}

/**
 * A wrapper around WeakMap.
 * @remarks The use of this class is historical as it served as an abstraction around an ES5 based weak map and ES6, if available. Eventually
 * this class should be removed in favour of helper functions around a WeakMap.
 */
export declare class WeakCache<T extends object, U> {
    #private;
    getOrCreate<TCreate extends U = U>(key: T, createFunc: () => TCreate): TCreate;
    has(key: T): boolean;
    get(key: T): U | undefined;
    set(key: T, value: U): void;
    removeByKey(key: T): void;
}

/**
 * Compares two values specifying the sort order.
 */
export interface Comparer<T> {
    /**
     * Checks the two items returning -1 if `a` preceeds, 0 if equal, and 1 if `a` follows.
     * @param a - Item to use.
     * @param b - Item to compare with.
     */
    compareTo(a: T, b: T): number;
}

/**
 * Converts a comparer to a stored comparer.
 */
export declare class ComparerToStoredComparer<T> implements StoredComparer<T> {
    #private;
    /**
     * Constructor.
     * @param comparer - Comparer to use.
     * @param storedValue - Stored value to use as the value to always compare the input of `compareTo` to.
     */
    constructor(comparer: Comparer<T>, storedValue: T);
    /** @inheritdoc */
    compareTo(value: T): number;
}

/**
 * Compares two strings by en-us-u-kf-upper locale.
 */
export declare class LocaleStringComparer implements Comparer<string> {
    /** Static instance for reuse. */
    static readonly instance: LocaleStringComparer;
    /** @inheritdoc */
    compareTo(a: string, b: string): 0 | 1 | -1;
}

/**
 * Compares two values based on one of their properties.
 */
export declare class PropertyComparer<TValue, TProperty> implements Comparer<TValue> {
    #private;
    /**
     * Constructor.
     * @param getProperty - Gets the property from the value to use for comparisons.
     * @param comparer - Comparer to compare the properties with.
     */
    constructor(getProperty: (value: TValue) => TProperty, comparer: Comparer<TProperty>);
    /** @inheritdoc */
    compareTo(a: TValue, b: TValue): number;
}

/**
 * A stored comparer that compares a property to a stored value.
 */
export declare class PropertyStoredComparer<TValue, TProperty> implements StoredComparer<TValue> {
    #private;
    /**
     * Constructor.
     * @param getProperty - Gets the property from the value.
     * @param comparer - Comparer to compare the property with.
     */
    constructor(getProperty: (value: TValue) => TProperty, comparer: StoredComparer<TProperty>);
    /** @inheritdoc */
    compareTo(value: TValue): number;
}

/**
 * Compares a value against a stored value.
 */
export interface StoredComparer<T> {
    /**
     * Checks the value against a stored value returning -1 if the stored value preceeds, 0 if the value is equal, and 1 if follows.
     * @param value - Value to compare.
     */
    compareTo(value: T): number;
}

/** Decorator for memoizing the result of a method or get accessor. */
export declare function Memoize(target: any, context: any): (this: any, ...args: any[]) => any;

/** Collection of helper functions that can be used to throw errors. */
export declare namespace errors {
    /**
     * Minimal attributes to show a error message with the node source.
     */
    interface Node {
        getSourceFile(): {
            getFilePath(): StandardizedFilePath;
            getFullText(): string;
        };
        getStart(): number;
    }
    /** Base error class. */
    abstract class BaseError extends Error {
        protected constructor();
    }
    /** Thrown when there is a problem with a provided argument. */
    class ArgumentError extends BaseError {
        constructor(argName: string, message: string, node?: Node);
    }
    /** Thrown when an argument is null or whitespace. */
    class ArgumentNullOrWhitespaceError extends ArgumentError {
        constructor(argName: string, node?: Node);
    }
    /** Thrown when an argument is out of range. */
    class ArgumentOutOfRangeError extends ArgumentError {
        constructor(argName: string, value: number, range: [number, number], node?: Node);
    }
    /** Thrown when an argument does not match an expected type. */
    class ArgumentTypeError extends ArgumentError {
        constructor(argName: string, expectedType: string, actualType: string, node?: Node);
    }
    /** Thrown when a file or directory path was not found. */
    class PathNotFoundError extends BaseError {
        readonly path: StandardizedFilePath;
        constructor(path: StandardizedFilePath, prefix?: string);
        readonly code: "ENOENT";
    }
    /** Thrown when a directory was not found. */
    class DirectoryNotFoundError extends PathNotFoundError {
        constructor(dirPath: StandardizedFilePath);
    }
    /** Thrown when a file was not found. */
    class FileNotFoundError extends PathNotFoundError {
        constructor(filePath: StandardizedFilePath);
    }
    /** Thrown when an action was taken that is not allowed. */
    class InvalidOperationError extends BaseError {
        constructor(message: string, node?: Node);
    }
    /** Thrown when a certain behaviour or feature has not been implemented. */
    class NotImplementedError extends BaseError {
        constructor(message?: string, node?: Node);
    }
    /** Thrown when an operation is not supported. */
    class NotSupportedError extends BaseError {
        constructor(message: string);
    }
    /**
     * Thows if not a type.
     * @param value - Value to check the type of.
     * @param expectedType - Expected type.
     * @param argName - Argument name.
     */
    function throwIfNotType(value: any, expectedType: string, argName: string): void;
    /**
     * Throws if the value is not a string.
     * @param value - Value to check.
     * @param argName - Arg name.
     */
    function throwIfNotString(value: string, argName: string): void;
    /**
     * Throws if the value is not a string or is whitespace.
     * @param value - Value to check.
     * @param argName - Arg name.
     */
    function throwIfWhitespaceOrNotString(value: string, argName: string): void;
    /**
     * Throws an ArgumentOutOfRangeError if an argument's value is out of an inclusive range.
     * @param value - Value.
     * @param range - Range.
     * @param argName - Argument name.
     */
    function throwIfOutOfRange(value: number, range: [number, number], argName: string): void;
    /**
     * Throws an ArgumentOutOfRangeError if an argument's range value is out of an inclusive range.
     *
     * Also throws when the start of the range is greater than the end.
     * @param actualRange - Range to check.
     * @param range - Range to check against.
     * @param argName - Argument name.
     */
    function throwIfRangeOutOfRange(actualRange: [number, number], range: [number, number], argName: string): void;
    /**
     * Gets an error saying that a feature is not implemented for a certain syntax kind.
     * @param kind - Syntax kind that isn't implemented.
     */
    function throwNotImplementedForSyntaxKindError(kind: ts.SyntaxKind, node?: Node): never;
    /**
     * Throws an Argument
     * @param value
     * @param argName
     */
    function throwIfNegative(value: number, argName: string): void;
    /**
     * Throws when the value is null or undefined.
     * @param value - Value to check.
     * @param errorMessage - Error message to throw when not defined.
     */
    function throwIfNullOrUndefined<T>(value: T | undefined, errorMessage: string | (() => string), node?: Node): T;
    /**
     * Throw if the value should have been the never type.
     * @param value - Value to check.
     */
    function throwNotImplementedForNeverValueError(value: never, sourceNode?: Node): never;
    /**
     * Throws an error if the actual value does not equal the expected value.
     * @param actual - Actual value.
     * @param expected - Expected value.
     * @param description - Message to show in the error. Should be a full sentence that doesn't include the actual and expected values.
     */
    function throwIfNotEqual<T>(actual: T, expected: T, description: string): void;
    /**
     * Throws if true.
     * @param value - Value to check.
     * @param errorMessage - Error message to throw when true.
     */
    function throwIfTrue(value: boolean | undefined, errorMessage: string): void;
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

/** Utilities for working with files. */
export declare class FileUtils {
    #private;
    static readonly ENOENT = "ENOENT";
    private constructor();
    /**
     * Gets if the error is a file not found or directory not found error.
     * @param err - Error to check.
     */
    static isNotExistsError(err: any): boolean;
    /**
     * Joins the paths.
     * @param paths - Paths to join.
     */
    static pathJoin<T extends string>(basePath: T, ...paths: string[]): T;
    /**
     * Gets if the path is absolute.
     * @param fileOrDirPath - File or directory path.
     */
    static pathIsAbsolute(fileOrDirPath: string): boolean;
    /**
     * Gets the standardized absolute path.
     * @param fileSystem - File system.
     * @param fileOrDirPath - Path to standardize.
     * @param relativeBase - Base path to be relative from.
     */
    static getStandardizedAbsolutePath(fileSystem: FileSystemHost, fileOrDirPath: string, relativeBase?: string): StandardizedFilePath;
    /**
     * Gets the directory path.
     * @param fileOrDirPath - Path to get the directory name from.
     */
    static getDirPath<T extends string>(fileOrDirPath: T): T;
    /**
     * Gets the last portion of the path.
     * @param fileOrDirPath - Path to get the base name from.
     */
    static getBaseName(fileOrDirPath: StandardizedFilePath): string;
    /**
     * Gets the extension of the file name.
     * @param fileOrDirPath - Path to get the extension from.
     */
    static getExtension(fileOrDirPath: StandardizedFilePath): string;
    /**
     * Changes all back slashes to forward slashes.
     * @param fileOrDirPath - Path.
     */
    static standardizeSlashes<T extends string>(fileOrDirPath: T): T;
    /**
     * Checks if a path ends with a specified search path.
     * @param fileOrDirPath - Path.
     * @param endsWithPath - Ends with path.
     */
    static pathEndsWith(fileOrDirPath: string | undefined, endsWithPath: string | undefined): boolean;
    /**
     * Checks if a path starts with a specified search path.
     * @param fileOrDirPath - Path.
     * @param startsWithPath - Starts with path.
     */
    static pathStartsWith(fileOrDirPath: string | undefined, startsWithPath: string | undefined): boolean;
    /**
     * Gets the parent most paths out of the list of paths.
     * @param paths - File or directory paths.
     */
    static getParentMostPaths(paths: StandardizedFilePath[]): StandardizedFilePath[];
    /**
     * Reads a file or returns false if the file doesn't exist.
     * @param fileSystem - File System.
     * @param filePath - Path to file.
     * @param encoding - File encoding.
     */
    static readFileOrNotExists(fileSystem: FileSystemHost, filePath: StandardizedFilePath, encoding: string): Promise<string | false>;
    /**
     * Reads a file synchronously or returns false if the file doesn't exist.
     * @param fileSystem - File System.
     * @param filePath - Path to file.
     * @param encoding - File encoding.
     */
    static readFileOrNotExistsSync(fileSystem: FileSystemHost, filePath: StandardizedFilePath, encoding: string): string | false;
    /**
     * Gets the text with a byte order mark.
     * @param text - Text.
     */
    static getTextWithByteOrderMark(text: string): string;
    /**
     * Gets the relative path from one absolute path to another.
     * @param absoluteDirPathFrom - Absolute directory path from.
     * @param absolutePathTo - Absolute path to.
     */
    static getRelativePathTo(absoluteDirPathFrom: StandardizedFilePath, absolutePathTo: StandardizedFilePath): StandardizedFilePath;
    /**
     * Gets if the path is for the root directory.
     * @param path - Path.
     */
    static isRootDirPath(dirOrFilePath: string): boolean;
    /**
     * Gets the descendant directories of the specified directory.
     * @param dirPath - Directory path.
     */
    static getDescendantDirectories(fileSystemWrapper: TransactionalFileSystem, dirPath: StandardizedFilePath): IterableIterator<StandardizedFilePath>;
    /**
     * Gets the glob as absolute.
     * @param glob - Glob.
     * @param cwd - Current working directory.
     */
    static toAbsoluteGlob(glob: string, cwd: string): string;
    /**
     * Gets if the glob is a negated glob.
     * @param glob - Glob.
     */
    static isNegatedGlob(glob: string): boolean;
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

/** Checks the specified file paths to see if the match any of the specified patterns. */
export declare function matchGlobs(paths: ReadonlyArray<string>, patterns: string | ReadonlyArray<string>, cwd: string): string[];

/** An implementation of a file host that interacts with the actual file system. */
export declare class RealFileSystemHost implements FileSystemHost {
    #private;
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
    /** @inheritdoc */
    isCaseSensitive(): boolean;
}

/** Nominal type to denote a file path that has been standardized. */
export type StandardizedFilePath = string & {
    _standardizedFilePathBrand: undefined;
};

export interface DirEntry {
    path: StandardizedFilePath;
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
}

export interface TransactionalFileSystemOptions {
    fileSystem: FileSystemHost;
    skipLoadingLibFiles: boolean | undefined;
    libFolderPath: string | undefined;
}

/**
 * FileSystemHost wrapper that allows transactionally queuing operations to the file system.
 */
export declare class TransactionalFileSystem {
    #private;
    /**
     * Constructor.
     * @param fileSystem - File system host to commit the operations to.
     */
    constructor(options: TransactionalFileSystemOptions);
    /**
     * Gets if the path is one of the lib files this file system serves from memory.
     *
     * These have no backing file, so every write, move and delete onto one is
     * rejected. There are none when the lib files are skipped or read from a real
     * folder, so this is a lookup rather than a test of the path.
     */
    libFileExists(filePath: StandardizedFilePath): boolean;
    queueFileDelete(filePath: StandardizedFilePath): void;
    removeFileDelete(filePath: StandardizedFilePath): void;
    queueMkdir(dirPath: StandardizedFilePath): void;
    queueDirectoryDelete(dirPath: StandardizedFilePath): void;
    queueMoveDirectory(srcPath: StandardizedFilePath, destPath: StandardizedFilePath): void;
    queueCopyDirectory(srcPath: StandardizedFilePath, destPath: StandardizedFilePath): void;
    flush(): Promise<void>;
    flushSync(): void;
    saveForDirectory(dirPath: StandardizedFilePath): Promise<void>;
    saveForDirectorySync(dirPath: StandardizedFilePath): void;
    moveFileImmediately(oldFilePath: StandardizedFilePath, newFilePath: StandardizedFilePath, fileText: string): Promise<void>;
    moveFileImmediatelySync(oldFilePath: StandardizedFilePath, newFilePath: StandardizedFilePath, fileText: string): void;
    deleteFileImmediately(filePath: StandardizedFilePath): Promise<void>;
    deleteFileImmediatelySync(filePath: StandardizedFilePath): void;
    copyDirectoryImmediately(srcDirPath: StandardizedFilePath, destDirPath: StandardizedFilePath): Promise<void>;
    copyDirectoryImmediatelySync(srcDirPath: StandardizedFilePath, destDirPath: StandardizedFilePath): void;
    moveDirectoryImmediately(srcDirPath: StandardizedFilePath, destDirPath: StandardizedFilePath): Promise<void>;
    moveDirectoryImmediatelySync(srcDirPath: StandardizedFilePath, destDirPath: StandardizedFilePath): void;
    deleteDirectoryImmediately(dirPath: StandardizedFilePath): Promise<void>;
    /** Recreates a directory on the underlying file system asynchronously. */
    clearDirectoryImmediately(dirPath: StandardizedFilePath): Promise<void>;
    /** Recreates a directory on the underlying file system synchronously. */
    clearDirectoryImmediatelySync(dirPath: StandardizedFilePath): void;
    deleteDirectoryImmediatelySync(dirPath: StandardizedFilePath): void;
    fileExists(filePath: StandardizedFilePath): boolean | Promise<boolean>;
    fileExistsSync(filePath: StandardizedFilePath): boolean;
    directoryExistsSync(dirPath: StandardizedFilePath): boolean;
    readFileIfExistsSync(filePath: StandardizedFilePath, encoding: string | undefined): string | undefined;
    readFileSync(filePath: StandardizedFilePath, encoding: string | undefined): string;
    readFileIfExists(filePath: StandardizedFilePath, encoding: string | undefined): Promise<string | undefined>;
    readFile(filePath: StandardizedFilePath, encoding: string | undefined): Promise<string>;
    readDirSync(dirPath: StandardizedFilePath): DirEntry[];
    glob(patterns: ReadonlyArray<string>): Promise<StandardizedFilePath[]>;
    globSync(patterns: ReadonlyArray<string>): Generator<StandardizedFilePath, void, unknown>;
    getFileSystem(): FileSystemHost;
    getCurrentDirectory(): StandardizedFilePath;
    getDirectories(dirPath: StandardizedFilePath): StandardizedFilePath[];
    realpathSync(path: StandardizedFilePath): StandardizedFilePath;
    getStandardizedAbsolutePath(fileOrDirPath: string, relativeBase?: string): StandardizedFilePath;
    readFileOrNotExists(filePath: StandardizedFilePath, encoding: string): false | Promise<string | false>;
    readFileOrNotExistsSync(filePath: StandardizedFilePath, encoding: string): string | false;
    writeFile(filePath: StandardizedFilePath, fileText: string): Promise<void>;
    writeFileSync(filePath: StandardizedFilePath, fileText: string): void;
}

/** Gets the TypeScript lib files (.d.ts files). */
export declare function getLibFiles(): {
    fileName: string;
    text: string;
}[];

export declare function getLibFolderPath(options: {
    libFolderPath?: string;
    skipLoadingLibFiles?: boolean;
}): string;

/** The folder to use to "store" the in memory lib files. */
export declare const libFolderInMemoryPath: StandardizedFilePath;

/**
 * Gets the enum name for the specified syntax kind.
 * @param kind - Syntax kind.
 */
export declare function getSyntaxKindName(kind: ts.SyntaxKind): string;

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

export declare const runtime: Runtime;

export interface Runtime {
    fs: RuntimeFileSystem;
    path: RuntimePath;
    getEnvVar(name: string): string | undefined;
    getEndOfLine(): string;
    getPathMatchesPattern(path: string, pattern: string): boolean;
}

export interface RuntimeDirEntry {
    name: string;
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
}

export interface RuntimeFileInfo {
    isFile(): boolean;
    isDirectory(): boolean;
}

export interface RuntimeFileSystem {
    /** Gets if this file system is case sensitive. */
    isCaseSensitive(): boolean;
    /** Asynchronously deletes the specified file or directory. */
    delete(path: string): Promise<void>;
    /** Synchronously deletes the specified file or directory */
    deleteSync(path: string): void;
    /** Reads all the child directories and files. */
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
    /** Asynchronously gets the path's stat information. */
    stat(path: string): Promise<RuntimeFileInfo | undefined>;
    /** Synchronously gets the path's stat information. */
    statSync(path: string): RuntimeFileInfo | undefined;
    /** See https://nodejs.org/api/fs.html#fs_fs_realpathsync_path_options */
    realpathSync(path: string): string;
    /** Gets the current directory of the environment. */
    getCurrentDirectory(): string;
    /** Uses pattern matching to find files or directories. */
    glob(patterns: ReadonlyArray<string>): Promise<string[]>;
    /** Synchronously uses pattern matching to find files or directories. */
    globSync(patterns: ReadonlyArray<string>): string[];
}

export interface RuntimePath {
    /** Joins the paths. */
    join(...paths: string[]): string;
    /** Normalizes the provided path. */
    normalize(path: string): string;
    /** Returns the relative path from `from` to `to`. */
    relative(from: string, to: string): string;
}

export declare class DocumentRegistry {
    #private;
    constructor(options?: DocumentRegistryOptions);
    /**
     * Adds a file or replaces its contents, and returns the parsed file. The
     * returned node tree is only valid until the next change to the same file.
     */
    createOrUpdateSourceFile(fileName: string, text: string): SourceFile;
    /**
     * Adds or replaces many files at once, and returns the parsed files in the order
     * they were given.
     *
     * Everything the batch touches is reported as a single change, so it costs one
     * reopen however many files it names — see {@link setSourceFileText} for why that
     * is what matters.
     */
    createOrUpdateSourceFiles(files: readonly {
        fileName: string;
        text: string;
    }[]): SourceFile[];
    /**
     * Adds a file or replaces its contents without parsing it.
     *
     * Asking for the parsed file is what forces the project open, and a reopen costs
     * time proportional to how many files the project holds — so adding files one at
     * a time through {@link createOrUpdateSourceFile} is quadratic in their number.
     * Nothing here reopens anything: the change waits with the others until the next
     * read of {@link project}, {@link program}, {@link checker} or
     * {@link getSourceFile}, so a run of these costs one reopen between them rather
     * than one each. The file is in the project from that read onwards, and a caller
     * that never takes one pays for no reopen at all.
     */
    setSourceFileText(fileName: string, text: string): void;
    /**
     * Writes a file's text and returns the parsed file, without opening the project.
     *
     * This is the syntactic edit: a manipulation rewrites one file's text and wants its
     * tree back, and nothing about that needs a program. {@link createOrUpdateSourceFile}
     * would open a snapshot for it — a program clone, a round trip, and the client's
     * per-file bookkeeping — which is ~85% of what an edit costs and does not shrink as
     * the change does. The change waits with the others until the next semantic read, the
     * same way {@link setSourceFileText}'s does.
     *
     * The write and the parse are one call rather than two so they cannot drift: a node
     * handle taken from the returned tree is an index into the tree the compiler builds
     * for *the text at that path*, so the text the registry holds and the text this parsed
     * have to be the same string. Everything else about the handle already holds — the
     * index is a pure function of the AST shape, and every route from a ts-morph node to
     * the compiler goes through {@link project}, {@link checker}, {@link program} or
     * {@link getSourceFile}, all of which flush first.
     */
    parseSourceFileText(fileName: string, text: string): SourceFile;
    /**
     * Parses the text the registry already holds for a file, without opening the project.
     *
     * This is what a file written by {@link setSourceFileText} costs to read back: the
     * text is already where the compiler would read it, so the tree is a parse and
     * nothing more. {@link getSourceFile} answers the same question by opening the
     * project, which is the right thing when the caller wants the file the *program*
     * holds — that one is bound, is the one every other file resolves against, and is
     * what a semantic question is asked of.
     */
    parseSourceFileAt(fileName: string): SourceFile;
    /**
     * Replaces the compiler options the registry's project is opened with.
     *
     * The options live in the synthetic tsconfig, so changing them rewrites it and
     * reopens the project — every file is reparsed against the new options — from the
     * next read of the project.
     */
    setCompilerOptions(compilerOptions: CompilerOptions): void;
    /**
     * Removes a file from the registry.
     *
     * The registry's copy of a file is what the compiler reads, so dropping it hands
     * the path back to the wider file system: whatever is there now speaks for it.
     * That is what keeps an import of a file the caller merely stopped tracking
     * resolving. Pass `discardContents` when the caller is vacating the path instead
     * — deleting the file, or putting a different one there — because then whatever
     * the file system still has is stale and must not be read back.
     */
    removeSourceFile(fileName: string, options?: RemoveSourceFileOptions): void;
    /** Returns the parsed file, or `undefined` when it is not in the project. */
    getSourceFile(fileName: string): SourceFile | undefined;
    getSourceFileOrThrow(fileName: string): SourceFile;
    /**
     * Whether the compiler found the file while searching `node_modules`, answered
     * without opening the project.
     *
     * This is not one of the doors — see {@link project} — because it cannot go stale.
     * How a file got into the program is settled when it arrives there and no edit moves
     * it, so the snapshot that is already open answers as well as a new one would. A file
     * no open snapshot holds — one the registry has only just been given, or any file at
     * all before the first read — was found by nothing, which is the answer.
     *
     * That matters because the question is asked of every file the moment it is first
     * manipulated, and the manipulation itself is syntactic: opening the project for it
     * would put back the per-edit snapshot that {@link parseSourceFileText} exists to
     * avoid.
     */
    isSourceFileFromExternalLibrary(fileName: string): boolean;
    /**
     * The number of times a file's contents have been replaced, or `undefined`
     * when the registry does not know the file. A file that has never been edited
     * is version "0", so an unknown file must not report one.
     */
    getSourceFileVersion(fileName: string): string | undefined;
    /**
     * The project the registry's files belong to.
     *
     * tsgo hangs the language service operations — formatting, organize imports,
     * rename, definitions, implementations, code fixes — off the project, so this
     * is the session seam callers reach them through.
     */
    get project(): Project;
    /** The project's checker, for type and symbol queries. */
    get checker(): ts.TypeChecker;
    /** The project's program, for diagnostics and file enumeration. */
    get program(): ts.Program;
    /**
     * How many snapshots the registry has opened.
     *
     * Every one of them is a program clone, a round trip and a pass over the client's
     * per-file bookkeeping, and the whole of the deferral above is that a syntactic
     * operation opens none. That is a property of the registry rather than of any one
     * method — a member added later could quietly reach the compiler and nothing would
     * look different — so it is counted here and asserted rather than argued. Tests read
     * this; nothing else has a reason to.
     */
    get snapshotsOpened(): number;
    dispose(): void;
}

export interface DocumentRegistryOptions {
    /**
     * Resolves module specifiers in place of the compiler. Nothing is asked of it
     * when absent, which is also when the compiler pays nothing for it.
     */
    resolveModuleName?: ModuleNameResolver;
    /** Compiler options for the registry's project. */
    compilerOptions?: CompilerOptions;
    /** Files to seed the registry with, as path → contents. */
    files?: Record<string, string>;
    /**
     * File system the compiler resolves through for anything the registry does not
     * hold — node_modules, `/// <reference>` targets, and files a tsconfig glob
     * would pull in. Defaults to nothing being reachable beyond the registry.
     */
    fs?: FileSystem;
    /**
     * Directory the default lib files are read from, through {@link fs}. tsgo
     * carries its own copies inside the wasm module and reads those unless a
     * folder is named here, which is how ts-morph's `libFolderPath` — and its
     * in-memory `/node_modules/typescript/lib` default — reach the compiler.
     */
    libFolderPath?: string;
    /**
     * Whether the file system distinguishes case. Defaults to true; a project on a
     * Windows or macOS disk says false so the compiler resolves a differently cased
     * module specifier the way that disk does.
     */
    useCaseSensitiveFileNames?: boolean;
}

export interface RemoveSourceFileOptions {
    /**
     * Whether the file's contents leave with it, rather than the file system's copy
     * of the path speaking for it again. Defaults to false.
     */
    discardContents?: boolean;
}

/** Adapts a {@link TransactionalFileSystem} to the file system tsgo expects. */
export declare function createFileSystemAdapter(fileSystem: TransactionalFileSystem, options?: FileSystemAdapterOptions): FileSystem;

export interface FileSystemAdapterOptions {
    /** Encoding used to read files. Defaults to "utf-8". */
    encoding?: string;
}

/** Creates a fully synchronous {@link API} backed by the in-process tsgo build. */
export declare function createInProcessApi(options?: InProcessApiOptions): API;

export interface InProcessApiOptions {
    /** Initial in-memory files (path → contents), including tsconfig.json. */
    files?: Record<string, string>;
    /** A custom virtual filesystem. Takes precedence over `files`. */
    fs?: FileSystem;
    /** Current working directory used for module resolution. Defaults to "/". */
    cwd?: string;
    /**
     * Directory the default lib files are read from, through the file system.
     * Defaults to the lib files bundled inside the wasm module.
     */
    defaultLibraryPath?: string;
    /** Whether the file system distinguishes case. Defaults to true. */
    useCaseSensitiveFileNames?: boolean;
    /**
     * The reactor module: already compiled, or the bytes to compile it from.
     * Defaults to the module shipped beside this bundle, or to whatever
     * `initializeWasm` compiled.
     *
     * A file path is deliberately not accepted, though it once was. One loader now
     * serves Node, Deno and the browser, and only two of those have a file system;
     * a path would be an option that exists everywhere and works in some places.
     * Read the file and pass the bytes, or hand over a compiled module.
     */
    wasm?: Uint8Array | ArrayBuffer | CompiledWasmModule;
}

/**
 * Creates a module resolution host based on the provided options.
 *
 * The host answers out of the project's in-memory state first and falls back to
 * the file system, so a file that only exists in the project is still found.
 * @param options - Options for creating the module resolution host.
 */
export declare function createModuleResolutionHost(options: CreateModuleResolutionHostOptions): ModuleResolutionHost;

/** Options for creating a module resolution host. */
export interface CreateModuleResolutionHostOptions {
    /** The transactional file system to use. */
    transactionalFileSystem: TransactionalFileSystem;
    /** The source file container to use. */
    sourceFileContainer: ModuleResolutionSourceFileContainer;
    /** Gets the encoding to use. */
    getEncoding(): string;
}

/**
 * The subset of a source file cache a module resolution host consults.
 *
 * Declared structurally so that both ts-morph's `CompilerFactory` and
 * `@ts-morph/bootstrap`'s `SourceFileCache` satisfy it as they are.
 */
export interface ModuleResolutionSourceFileContainer {
    containsDirectoryAtPath(dirPath: StandardizedFilePath): boolean;
    containsSourceFileAtPath(filePath: StandardizedFilePath): boolean;
    getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath): {
        getFullText(): string;
    } | undefined;
    getChildDirectoriesOfDirectory(dirPath: StandardizedFilePath): StandardizedFilePath[];
}

/**
 * Assigns `value` to `key` even when the prototype exposes it as a getter with
 * no setter, by defining an own data property that shadows it.
 */
export declare function setSourceFileProperty(sourceFile: SourceFile, key: string, value: unknown): void;

/**
 * The nearest node the compiler actually stores — the node itself, or the closest
 * ancestor that is not reconstructed.
 *
 * Positional questions (what is in scope here, what references this) still have an
 * answer for a rebuilt node, and it is the answer for the node that encloses it.
 * Returns undefined only if nothing in the chain is stored, which a node reached
 * from a parsed file cannot be.
 */
export declare function getStoredNode(node: Node): Node | undefined;

/** Gets if the node was rebuilt on the client and so has no compiler handle. */
export declare function isReconstructedNode(node: Node): boolean;

/**
 * A compiled `WebAssembly.Module`, ready to instantiate.
 *
 * Named here rather than written as `WebAssembly.Module` because that name is
 * declared by the DOM and web worker libraries and by nothing else: spelling it
 * would make these declarations, which every consumer type checks against,
 * require a `lib` that a Node project does not have. The shape is the standard
 * one, which carries no members of its own.
 */
export interface CompiledWasmModule {
}

/**
 * Compiles the TypeScript compiler, so that everything after it can be
 * synchronous.
 *
 * Required in a browser before creating a `Project`, where it must run inside a
 * Web Worker — the main thread refuses a WebAssembly module this large. Calling
 * it anywhere else is optional and simply front-loads work the first `Project`
 * would otherwise do; calling it with an explicit `wasm` replaces whatever was
 * compiled before.
 */
export declare function initializeWasm(options?: InitializeWasmOptions): Promise<void>;

/**
 * Asynchronous acquisition of the tsgo WebAssembly compiler, for hosts that
 * cannot read it from disk.
 *
 * Node and Deno need none of this: the loader reads `typescript.wasm.gz` from
 * beside the bundle on first use, synchronously, which is what lets
 * `new Project()` stay synchronous. A browser has no synchronous way to reach a
 * 9.5 MB asset, so it fetches, gunzips and compiles the module once through
 * {@link initializeWasm} and hands it to the loader; every call after that is
 * synchronous exactly as it is elsewhere.
 */
export interface InitializeWasmOptions {
    /**
     * Where the compiler comes from. Defaults to `typescript.wasm.gz` beside this
     * bundle, fetched from the same place the bundle was served from.
     *
     * A `Response` is accepted so that a cached copy costs the caller nothing to
     * use: the answer from `caches.match("/typescript.wasm.gz")` or from a service
     * worker goes straight in and is compiled off the stream. A compiled module is
     * accepted for the other way round: a module survives `postMessage`, so one
     * thread can compile the reactor once and hand it to every worker that needs
     * it.
     *
     * Bytes and responses may be gzipped or not — which they are is read off the
     * bytes, so the shipped asset and an unwrapped copy of it are equally good.
     */
    wasm?: Response | Promise<Response> | URL | Uint8Array | ArrayBuffer | CompiledWasmModule;
}

/**
 * Adapts a {@link ResolutionHost} to the resolver the tsgo client takes.
 *
 * Returns undefined when the host resolves nothing, so a project that was given
 * a host with no `resolveModuleName` does not pay a callback per specifier.
 */
export declare function toModuleNameResolver(host: ResolutionHost | undefined): ModuleNameResolver | undefined;

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

/**
 * Resolves the module resolution kind the compiler will actually use for the
 * given options.
 *
 * This mirrors `CompilerOptions.GetModuleResolutionKind` in
 * `internal/core/compileroptions.go`. It used to be `ts.getEmitModuleResolutionKind`
 * from the `typescript` package, which tsgo does not expose to JS, so it is
 * reimplemented here — it is a small pure function of the options.
 */
export declare function getEmitModuleResolutionKind(compilerOptions: ts.CompilerOptions): ModuleResolutionKind;

/**
 * Resolves the script target the compiler will actually use for the given options.
 *
 * Mirrors `CompilerOptions.GetEmitScriptTarget`, whose no-target fallback is
 * `ScriptTargetLatestStandard` (ES2025).
 */
export declare function getEmitScriptTarget(compilerOptions: ts.CompilerOptions): ScriptTarget;

/**
 * Resolves the script target source files are parsed at for the given options.
 *
 * This is deliberately not `getEmitScriptTarget`: the compiler's *emit* target
 * falls back to ES2025, but ts-morph has always parsed at `ScriptTarget.Latest`
 * when no target is configured, and that is the value `SourceFile#getLanguageVersion`
 * reports.
 */
export declare function getParseScriptTarget(compilerOptions: ts.CompilerOptions): ScriptTarget;

export declare class ArrayUtils {
    private constructor();
    static isReadonlyArray<T>(a: unknown): a is ReadonlyArray<T>;
    static isNullOrEmpty<T>(a: ReadonlyArray<T> | undefined): a is undefined;
    static getUniqueItems<T>(a: ReadonlyArray<T>): T[];
    static removeFirst<T>(a: T[], item: T): boolean;
    static removeAll<T>(a: T[], isMatch: (item: T) => boolean): T[];
    static toIterator<T>(items: ReadonlyArray<T>): Generator<T, void, unknown>;
    static sortByProperty<T>(items: T[], getProp: (item: T) => string | number): T[];
    static groupBy<T>(items: ReadonlyArray<T>, getGroup: (item: T) => string | number): T[][];
    static binaryInsertWithOverwrite<T>(items: T[], newItem: T, comparer: Comparer<T>): void;
    static binarySearch<T>(items: ReadonlyArray<T>, storedComparer: StoredComparer<T>): number;
    static containsSubArray<T>(items: ReadonlyArray<T>, subArray: ReadonlyArray<T>): boolean;
}

/**
 * Deep clones an object not maintaining references.
 * @remarks If this has a circular reference it will go forever so be careful.
 */
export declare function deepClone<T extends object>(objToClone: T): T;

/**
 * Event container subscription type
 */
export type EventContainerSubscription<EventArgType> = (arg: EventArgType) => void;

/**
 * Event container for event subscriptions.
 */
export declare class EventContainer<EventArgType = undefined> {
    #private;
    /**
     * Subscribe to an event being fired.
     * @param subscription - Subscription.
     */
    subscribe(subscription: EventContainerSubscription<EventArgType>): void;
    /**
     * Unsubscribe to an event being fired.
     * @param subscription - Subscription.
     */
    unsubscribe(subscription: EventContainerSubscription<EventArgType>): void;
    /**
     * Fire an event.
     */
    fire(arg: EventArgType): void;
}

export declare class IterableUtils {
    static find<T>(items: IterableIterator<T>, condition: (item: T) => boolean): T | undefined;
}

export declare function nameof<TObject>(obj: TObject, key: keyof TObject): string;

export declare function nameof<TObject>(key: keyof TObject): string;

export declare class ObjectUtils {
    private constructor();
    static clone<T>(obj: T): T;
}

export declare class StringUtils {
    private constructor();
    static isWhitespaceCharCode(charCode: number | undefined): boolean;
    static isSpaces(text: string): boolean;
    static hasBom(text: string): boolean;
    static stripBom(text: string): string;
    static stripQuotes(text: string): string;
    static isQuoted(text: string): boolean;
    static isNullOrWhitespace(str: string | undefined): str is undefined;
    static isNullOrEmpty(str: string | undefined): str is undefined;
    static isWhitespace(text: string | undefined): boolean;
    static startsWithNewLine(str: string | undefined): boolean;
    static endsWithNewLine(str: string | undefined): boolean;
    static insertAtLastNonWhitespace(str: string, insertText: string): string;
    static getLineNumberAtPos(str: string, pos: number): number;
    static getLengthFromLineStartAtPos(str: string, pos: number): number;
    static getLineStartFromPos(str: string, pos: number): number;
    static getLineEndFromPos(str: string, pos: number): number;
    static escapeForWithinString(str: string, quoteKind: "\"" | "'"): string;
    /**
     * Escapes all the occurrences of the char in the string.
     */
    static escapeChar(str: string, char: string): string;
    static removeIndentation(str: string, opts: {
        isInStringAtPos: (pos: number) => boolean;
        indentSizeInSpaces: number;
    }): string;
    static indent(str: string, times: number, options: {
        indentText: string;
        indentSizeInSpaces: number;
        isInStringAtPos: (pos: number) => boolean;
    }): string;
}

export { ResolvedModuleName } from "./tsgo/api/options";
export { getChildren, getLastToken } from "./tsgo/ast/children";
export import CompilerOptions = ts.CompilerOptions;
export import DiagnosticCategory = ts.DiagnosticCategory;
export import EditorSettings = ts.EditorSettings;
export import EmitHint = ts.EmitHint;
export type FreshableType = ts.FreshableType;
export type ImportPhaseModifierSyntaxKind = ts.ImportPhaseModifierSyntaxKind;
export import IndentStyle = ts.IndentStyle;
export import LanguageVariant = ts.LanguageVariant;
export import ModuleKind = ts.ModuleKind;
export import ModuleResolutionKind = ts.ModuleResolutionKind;
export import NewLineKind = ts.NewLineKind;
export import NodeFlags = ts.NodeFlags;
export import ObjectFlags = ts.ObjectFlags;
export import ScriptKind = ts.ScriptKind;
export import ScriptTarget = ts.ScriptTarget;
export import SymbolFlags = ts.SymbolFlags;
export import SyntaxKind = ts.SyntaxKind;
export import TokenFlags = ts.TokenFlags;
export import TypeFlags = ts.TypeFlags;
export import TypeFormatFlags = ts.TypeFormatFlags;
export { ts };
