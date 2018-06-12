import { ts, SyntaxKind, CompilerOptions, EmitHint, ScriptKind, NewLineKind, LanguageVariant, ScriptTarget, TypeFlags, ObjectFlags, SymbolFlags, TypeFormatFlags, DiagnosticCategory, EditorSettings, ModuleResolutionKind, CompilerApiNodeBrandPropertyNamesType } from "./typescript/typescript";
import { CodeBlockWriter } from "./codeBlockWriter/code-block-writer";

export declare class Directory {
    private _global;
    private _path;
    private _pathParts;
    /**
     * Checks if this directory is an ancestor of the provided directory.
     * @param possibleDescendant - Directory or source file that's a possible descendant.
     */
    isAncestorOf(possibleDescendant: Directory | SourceFile): boolean;
    /**
     * Checks if this directory is a descendant of the provided directory.
     * @param possibleAncestor - Directory or source file that's a possible ancestor.
     */
    isDescendantOf(possibleAncestor: Directory): boolean;
    /**
     * Gets the path to the directory.
     */
    getPath(): string;
    /**
     * Gets the directory path's base name.
     */
    getBaseName(): string;
    /**
     * Gets the parent directory or throws if it doesn't exist or was never added to the AST.
     */
    getParentOrThrow(): Directory;
    /**
     * Gets the parent directory if it exists and was added to the AST.
     */
    getParent(): Directory | undefined;
    /**
     * Gets a child directory with the specified path or throws if not found.
     * @param path - Relative path from this directory or absolute path.
     */
    getDirectoryOrThrow(path: string): Directory;
    /**
     * Gets a child directory by the specified condition or throws if not found.
     * @param condition - Condition to check the directory with.
     */
    getDirectoryOrThrow(condition: (directory: Directory) => boolean): Directory;
    /**
     * Gets a directory with the specified path or undefined if not found.
     * @param path - Relative path from this directory or absolute path.
     */
    getDirectory(path: string): Directory | undefined;
    /**
     * Gets a child directory by the specified condition or undefined if not found.
     * @param condition - Condition to check the directory with.
     */
    getDirectory(condition: (directory: Directory) => boolean): Directory | undefined;
    /**
     * Gets a child source file with the specified path or throws if not found.
     * @param path - Relative or absolute path to the file.
     */
    getSourceFileOrThrow(path: string): SourceFile;
    /**
     * Gets a child source file by the specified condition or throws if not found.
     * @param condition - Condition to check the source file with.
     */
    getSourceFileOrThrow(condition: (sourceFile: SourceFile) => boolean): SourceFile;
    /**
     * Gets a child source file with the specified path or undefined if not found.
     * @param path - Relative or absolute path to the file.
     */
    getSourceFile(path: string): SourceFile | undefined;
    /**
     * Gets a child source file by the specified condition or undefined if not found.
     * @param condition - Condition to check the source file with.
     */
    getSourceFile(condition: (sourceFile: SourceFile) => boolean): SourceFile | undefined;
    /**
     * Gets the child directories.
     */
    getDirectories(): Directory[];
    /**
     * Gets the source files within this directory.
     */
    getSourceFiles(): SourceFile[];
    /**
     * Gets the source files in the current directory and all the descendant directories.
     */
    getDescendantSourceFiles(): SourceFile[];
    /**
     * Gets the descendant directories.
     */
    getDescendantDirectories(): Directory[];
    /**
     * Adds an existing directory to the AST from the relative path or directory name, or returns undefined if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Directory name or path to the directory that should be added.
     * @param options - Options.
     */
    addExistingDirectoryIfExists(dirPath: string, options?: DirectoryAddOptions): Directory | undefined;
    /**
     * Adds an existing directory to the AST from the relative path or directory name, or throws if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Directory name or path to the directory that should be added.
     * @throws DirectoryNotFoundError if the directory does not exist.
     */
    addExistingDirectory(dirPath: string, options?: DirectoryAddOptions): Directory;
    /**
     * Creates a directory if it doesn't exist.
     * @param dirPath - Relative or absolute path to the directory that should be created.
     */
    createDirectory(dirPath: string): Directory;
    /**
     * Creates a source file in the AST, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string): SourceFile;
    /**
     * Creates a source file in the AST, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @param sourceFileText - Text of the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string, sourceFileText: string, options?: SourceFileCreateOptions): SourceFile;
    /**
     * Creates a source file in the AST, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @param structure - Structure that represents the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string, structure: SourceFileStructure, options?: SourceFileCreateOptions): SourceFile;
    /**
     * Adds an existing source file to the AST, relative to this directory, or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     * @param options - Options for adding the source file.
     */
    addExistingSourceFileIfExists(relativeFilePath: string, options?: SourceFileAddOptions): SourceFile | undefined;
    /**
     * Adds an existing source file to the AST, relative to this directory, or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     * @param options - Options for adding the source file.
     * @throws FileNotFoundError when the file doesn't exist.
     */
    addExistingSourceFile(relativeFilePath: string, options?: SourceFileAddOptions): SourceFile;
    /**
     * Emits the files in the directory.
     * @param options - Options for emitting.
     */
    emit(options?: {
        emitOnlyDtsFiles?: boolean;
        outDir?: string;
        declarationDir?: string;
    }): Promise<DirectoryEmitResult>;
    /**
     * Emits the files in the directory synchronously.
     *
     * Remarks: This might be very slow compared to the asynchronous version if there are a lot of files.
     * @param options - Options for emitting.
     */
    emitSync(options?: {
        emitOnlyDtsFiles?: boolean;
        outDir?: string;
        declarationDir?: string;
    }): DirectoryEmitResult;
    private _emitInternal;
    /**
     * Copies a directory to a new directory.
     * @param relativeOrAbsolutePath - The relative or absolute path to the new directory.
     * @param options - Options.
     * @returns The directory the copy was made to.
     */
    copy(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions): Directory;
    /**
     * Immediately copies the directory to the specified path asynchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     * @remarks If includeTrackedFiles is true, then it will execute the pending operations in the current directory.
     */
    copyImmediately(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions): Promise<Directory>;
    /**
     * Immediately copies the directory to the specified path synchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     * @remarks If includeTrackedFiles is true, then it will execute the pending operations in the current directory.
     */
    copyImmediatelySync(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions): Directory;
    /**
     * Moves the directory to a new path.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    move(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions): this;
    /**
     * Immediately moves the directory to a new path asynchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    moveImmediately(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions): Promise<this>;
    /**
     * Immediately moves the directory to a new path synchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    moveImmediatelySync(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions): this;
    /**
     * Queues a deletion of the directory to the file system.
     *
     * The directory will be deleted when calling ast.save(). If you wish to delete the file immediately, then use deleteImmediately().
     */
    delete(): void;
    /**
     * Asyncronously deletes the directory and all its descendants from the file system.
     */
    deleteImmediately(): Promise<void>;
    /**
     * Synchronously deletes the directory and all its descendants from the file system.
     */
    deleteImmediatelySync(): void;
    /**
     * Forgets the directory and all its descendants from the Project.
     *
     * Note: Does not delete the directory from the file system.
     */
    forget(): void;
    /**
     * Asynchronously saves the directory and all the unsaved source files to the disk.
     */
    save(): Promise<void>;
    /**
     * Synchronously saves the directory and all the unsaved source files to the disk.
     */
    saveSync(): void;
    /**
     * Gets the relative path to another source file.
     * @param sourceFile - Source file.
     */
    getRelativePathTo(sourceFile: SourceFile): string;
    /**
     * Gets the relative path to another directory.
     * @param directory - Directory.
     */
    getRelativePathTo(directory: Directory): string;
    /**
     * Gets the relative path to the specified source file as a module specifier.
     * @param sourceFile - Source file.
     */
    getRelativePathAsModuleSpecifierTo(sourceFile: SourceFile): string;
    /**
     * Gets the relative path to the specified directory as a module specifier.
     * @param directory - Directory.
     */
    getRelativePathAsModuleSpecifierTo(directory: Directory): string;
    /**
     * Gets if the directory was forgotten.
     */
    wasForgotten(): boolean;
}

export interface DirectoryAddOptions {
    /**
     * Whether to also recursively add all the directory's descendant directories.
     * @remarks Defaults to false.
     */
    recursive?: boolean;
}

export interface DirectoryCopyOptions extends SourceFileCopyOptions {
    /**
     * Includes all the files in the directory and sub-directory when copying.
     * @remarks - Defaults to true.
     */
    includeUntrackedFiles?: boolean;
}
export declare class DirectoryEmitResult {
    private readonly _emitSkipped;
    private readonly _outputFilePaths;
    /**
     * Gets if the emit was skipped.
     */
    getEmitSkipped(): boolean;
    /**
     * Gets the output file paths.
     */
    getOutputFilePaths(): string[];
}

export interface DirectoryMoveOptions extends SourceFileMoveOptions {
}
export interface FileSystemHost {
    delete(path: string): Promise<void>;
    deleteSync(path: string): void;
    readDirSync(dirPath: string): string[];
    readFile(filePath: string, encoding?: string): Promise<string>;
    readFileSync(filePath: string, encoding?: string): string;
    writeFile(filePath: string, fileText: string): Promise<void>;
    writeFileSync(filePath: string, fileText: string): void;
    mkdir(dirPath: string): Promise<void>;
    mkdirSync(dirPath: string): void;
    move(srcPath: string, destPath: string): Promise<void>;
    moveSync(srcPath: string, destPath: string): void;
    copy(srcPath: string, destPath: string): Promise<void>;
    copySync(srcPath: string, destPath: string): void;
    fileExists(filePath: string): Promise<boolean>;
    fileExistsSync(filePath: string): boolean;
    directoryExists(dirPath: string): Promise<boolean>;
    directoryExistsSync(dirPath: string): boolean;
    getCurrentDirectory(): string;
    glob(patterns: string[]): string[];
}

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

/**
 * Project that holds source files.
 */
export declare class Project {
    /**
     * Initializes a new instance.
     * @param options - Optional options.
     * @param fileSystem - Optional file system host. Useful for mocking access to the file system.
     */
    constructor(options?: Options, fileSystem?: FileSystemHost);
    /** Gets the manipulation settings. */
    readonly manipulationSettings: ManipulationSettingsContainer;
    /** Gets the compiler options for modification. */
    readonly compilerOptions: CompilerOptionsContainer;
    /**
     * Adds an existing directory from the path or returns undefined if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Path to add the directory at.
     * @param options - Options.
     */
    addExistingDirectoryIfExists(dirPath: string, options?: DirectoryAddOptions): Directory | undefined;
    /**
     * Adds an existing directory from the path or throws if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Path to add the directory at.
     * @param options - Options.
     * @throws DirectoryNotFoundError when the directory does not exist.
     */
    addExistingDirectory(dirPath: string, options?: DirectoryAddOptions): Directory;
    /**
     * Creates a directory at the specified path.
     * @param dirPath - Path to create the directory at.
     */
    createDirectory(dirPath: string): Directory;
    /**
     * Gets a directory by the specified path or throws if it doesn't exist.
     * @param dirPath - Path to create the directory at.
     */
    getDirectoryOrThrow(dirPath: string): Directory;
    /**
     * Gets a directory by the specified path or returns undefined if it doesn't exist.
     * @param dirPath - Directory path.
     */
    getDirectory(dirPath: string): Directory | undefined;
    /**
     * Gets all the directories.
     */
    getDirectories(): Directory[];
    /**
     * Gets the directories without a parent.
     */
    getRootDirectories(): Directory[];
    /**
     * Add source files based on a file glob.
     * @param fileGlobs - File glob to add files based on.
     * @param options - Options for adding the source file.
     * @returns The matched source files.
     */
    addExistingSourceFiles(fileGlob: string, options?: SourceFileAddOptions): SourceFile[];
    /**
     * Add source files based on file globs.
     * @param fileGlobs - File globs to add files based on.
     * @param options - Options for adding the source file.
     * @returns The matched source files.
     */
    addExistingSourceFiles(fileGlobs: string[], options?: SourceFileAddOptions): SourceFile[];
    /**
     * Adds a source file from a file path if it exists or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the source file.
     */
    addExistingSourceFileIfExists(filePath: string, options?: SourceFileAddOptions): SourceFile | undefined;
    /**
     * Adds an existing source file from a file path or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     * @param options - Options for adding the source file.
     * @throws FileNotFoundError when the file is not found.
     */
    addExistingSourceFile(filePath: string, options?: SourceFileAddOptions): SourceFile;
    /**
     * Adds all the source files from the specified tsconfig.json.
     *
     * Note that this is done by default when specifying a tsconfig file in the constructor and not explicitly setting the
     * addFilesFromTsConfig option to false.
     * @param tsConfigFilePath - File path to the tsconfig.json file.
     * @param options - Options for adding the source file.
     */
    addSourceFilesFromTsConfig(tsConfigFilePath: string, options?: SourceFileAddOptions): SourceFile[];
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
    /**
     * Removes a source file from the AST.
     * @param sourceFile - Source file to remove.
     * @returns True if removed.
     */
    removeSourceFile(sourceFile: SourceFile): boolean;
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
    getSourceFiles(globPatterns: string[]): SourceFile[];
    /**
     * Saves all the unsaved source files to the file system and deletes all deleted files.
     */
    save(): Promise<void>;
    /**
     * Synchronously saves all the unsaved source files to the file system and deletes all deleted files.
     *
     * Remarks: This might be very slow compared to the asynchronous version if there are a lot of files.
     */
    saveSync(): void;
    /**
     * Enables logging to the console.
     * @param enabled - Enabled.
     */
    enableLogging(enabled?: boolean): void;
    private getUnsavedSourceFiles;
    /**
     * Gets the compiler diagnostics.
     */
    getDiagnostics(): Diagnostic[];
    /**
     * Gets the pre-emit diagnostics.
     */
    getPreEmitDiagnostics(): Diagnostic[];
    /**
     * Gets the language service.
     */
    getLanguageService(): LanguageService;
    /**
     * Gets the program.
     */
    getProgram(): Program;
    /**
     * Gets the type checker.
     */
    getTypeChecker(): TypeChecker;
    /**
     * Gets the file system.
     */
    getFileSystem(): FileSystemHost;
    /**
     * Emits all the source files.
     * @param emitOptions - Optional emit options.
     */
    emit(emitOptions?: EmitOptions): EmitResult;
    /**
     * Gets the compiler options.
     */
    getCompilerOptions(): CompilerOptions;
    /**
     * Creates a writer with the current manipulation settings.
     * @remarks Generally it's best to use a provided writer, but this may be useful in some scenarios.
     */
    createWriter(): CodeBlockWriter;
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
}
export default Project;

export interface SourceFileAddOptions {
    languageVersion?: ScriptTarget;
}

export interface SourceFileCreateOptions extends SourceFileAddOptions {
    overwrite?: boolean;
}

export declare type Constructor<T> = new (...args: any[]) => T;

export declare type WriterFunction = (writer: CodeBlockWriter) => void;

/**
 * Creates a wrapped node from a compiler node.
 * @param node - Node to create a wrapped node from.
 * @param info - Info for creating the wrapped node.
 */
export declare function createWrappedNode<T extends ts.Node = ts.Node>(node: T, opts?: CreateWrappedNodeOptions): CompilerNodeToWrappedType<T>;

export interface CreateWrappedNodeOptions {
    /**
     * Compiler options.
     */
    compilerOptions?: CompilerOptions;
    /**
     * Optional source file of the node. Will make it not bother going up the tree to find the source file.
     */
    sourceFile?: ts.SourceFile;
    /**
     * Type checker.
     */
    typeChecker?: ts.TypeChecker;
}

/**
 * Prints the provided node using the compiler's printer.
 * @param node - Compiler node.
 * @param options - Options.
 */
export declare function printNode(node: ts.Node, options?: PrintNodeOptions): string;

/**
 * Prints the provided node using the compiler's printer.
 * @param node - Compiler node.
 * @param sourceFile - Compiler source file.
 * @param options - Options.
 */
export declare function printNode(node: ts.Node, sourceFile: ts.SourceFile, options?: PrintNodeOptions): string;

/**
 * Options for printing a node.
 */
export interface PrintNodeOptions {
    /**
     * Whether to remove comments or not.
     */
    removeComments?: boolean;
    /**
     * New line kind.
     *
     * Defaults to line feed.
     */
    newLineKind?: NewLineKind;
    /**
     * From the compiler api: "A value indicating the purpose of a node. This is primarily used to
     * distinguish between an `Identifier` used in an expression position, versus an
     * `Identifier` used as an `IdentifierName` as part of a declaration. For most nodes you
     * should just pass `Unspecified`."
     *
     * Defaults to `Unspecified`.
     */
    emitHint?: EmitHint;
    /**
     * The script kind.
     *
     * Defaults to TSX. This is only useful when not using a wrapped node and not providing a source file.
     */
    scriptKind?: ScriptKind;
}

export declare type SourceFileReferencingNodes = ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration | CallExpression;

export interface CompilerOptionsFromTsConfigOptions {
    encoding?: string;
    fileSystem?: FileSystemHost;
}

export interface CompilerOptionsFromTsConfigResult {
    options: CompilerOptions;
    errors: Diagnostic[];
}

/**
 * Gets the compiler options from a specified tsconfig.json
 * @param filePath - File path to the tsconfig.json.
 * @param options - Options.
 */
export declare function getCompilerOptionsFromTsConfig(filePath: string, options?: CompilerOptionsFromTsConfigOptions): CompilerOptionsFromTsConfigResult;

/**
 * Type guards for checking the type of a node.
 */
export declare class TypeGuards {
    private constructor();
    /**
     * Gets if the node has an expression.
     * @param node - Node to check.
     */
    static hasExpression(node: Node): node is Node & {
        getExpression(): Expression;
    };
    /**
     * Gets if the node has a name.
     * @param node - Node to check.
     */
    static hasName(node: Node): node is Node & {
        getName(): string;
    };
    /**
     * Gets if the node has a body.
     * @param node - Node to check.
     */
    static hasBody(node: Node): node is Node & {
        getBody(): Node;
    };
    /**
     * Gets if the node is an AbstractableNode.
     * @param node - Node to check.
     */
    static isAbstractableNode(node: Node): node is AbstractableNode & Node;
    /**
     * Gets if the node is an AmbientableNode.
     * @param node - Node to check.
     */
    static isAmbientableNode(node: Node): node is AmbientableNode & Node;
    /**
     * Gets if the node is an AnyKeyword.
     * @param node - Node to check.
     */
    static isAnyKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is an ArgumentedNode.
     * @param node - Node to check.
     */
    static isArgumentedNode(node: Node): node is ArgumentedNode & Node;
    /**
     * Gets if the node is an ArrayLiteralExpression.
     * @param node - Node to check.
     */
    static isArrayLiteralExpression(node: Node): node is ArrayLiteralExpression;
    /**
     * Gets if the node is an ArrayTypeNode.
     * @param node - Node to check.
     */
    static isArrayTypeNode(node: Node): node is ArrayTypeNode;
    /**
     * Gets if the node is an ArrowFunction.
     * @param node - Node to check.
     */
    static isArrowFunction(node: Node): node is ArrowFunction;
    /**
     * Gets if the node is an AsExpression.
     * @param node - Node to check.
     */
    static isAsExpression(node: Node): node is AsExpression;
    /**
     * Gets if the node is an AsyncableNode.
     * @param node - Node to check.
     */
    static isAsyncableNode(node: Node): node is AsyncableNode & Node;
    /**
     * Gets if the node is an AwaitExpression.
     * @param node - Node to check.
     */
    static isAwaitExpression(node: Node): node is AwaitExpression;
    /**
     * Gets if the node is an AwaitableNode.
     * @param node - Node to check.
     */
    static isAwaitableNode(node: Node): node is AwaitableNode & Node;
    /**
     * Gets if the node is a BinaryExpression.
     * @param node - Node to check.
     */
    static isBinaryExpression(node: Node): node is BinaryExpression;
    /**
     * Gets if the node is a BindingNamedNode.
     * @param node - Node to check.
     */
    static isBindingNamedNode(node: Node): node is BindingNamedNode & Node;
    /**
     * Gets if the node is a Block.
     * @param node - Node to check.
     */
    static isBlock(node: Node): node is Block;
    /**
     * Gets if the node is a BodiedNode.
     * @param node - Node to check.
     */
    static isBodiedNode(node: Node): node is BodiedNode & Node;
    /**
     * Gets if the node is a BodyableNode.
     * @param node - Node to check.
     */
    static isBodyableNode(node: Node): node is BodyableNode & Node;
    /**
     * Gets if the node is a BooleanKeyword.
     * @param node - Node to check.
     */
    static isBooleanKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is a BooleanLiteral.
     * @param node - Node to check.
     */
    static isBooleanLiteral(node: Node): node is BooleanLiteral;
    /**
     * Gets if the node is a BreakStatement.
     * @param node - Node to check.
     */
    static isBreakStatement(node: Node): node is BreakStatement;
    /**
     * Gets if the node is a CallExpression.
     * @param node - Node to check.
     */
    static isCallExpression(node: Node): node is CallExpression;
    /**
     * Gets if the node is a CallSignatureDeclaration.
     * @param node - Node to check.
     */
    static isCallSignatureDeclaration(node: Node): node is CallSignatureDeclaration;
    /**
     * Gets if the node is a CaseBlock.
     * @param node - Node to check.
     */
    static isCaseBlock(node: Node): node is CaseBlock;
    /**
     * Gets if the node is a CaseClause.
     * @param node - Node to check.
     */
    static isCaseClause(node: Node): node is CaseClause;
    /**
     * Gets if the node is a CatchClause.
     * @param node - Node to check.
     */
    static isCatchClause(node: Node): node is CatchClause;
    /**
     * Gets if the node is a ChildOrderableNode.
     * @param node - Node to check.
     */
    static isChildOrderableNode(node: Node): node is ChildOrderableNode & Node;
    /**
     * Gets if the node is a ClassDeclaration.
     * @param node - Node to check.
     */
    static isClassDeclaration(node: Node): node is ClassDeclaration;
    /**
     * Gets if the node is a CommaListExpression.
     * @param node - Node to check.
     */
    static isCommaListExpression(node: Node): node is CommaListExpression;
    /**
     * Gets if the node is a ComputedPropertyName.
     * @param node - Node to check.
     */
    static isComputedPropertyName(node: Node): node is ComputedPropertyName;
    /**
     * Gets if the node is a ConditionalExpression.
     * @param node - Node to check.
     */
    static isConditionalExpression(node: Node): node is ConditionalExpression;
    /**
     * Gets if the node is a ConstructSignatureDeclaration.
     * @param node - Node to check.
     */
    static isConstructSignatureDeclaration(node: Node): node is ConstructSignatureDeclaration;
    /**
     * Gets if the node is a ConstructorDeclaration.
     * @param node - Node to check.
     */
    static isConstructorDeclaration(node: Node): node is ConstructorDeclaration;
    /**
     * Gets if the node is a ConstructorTypeNode.
     * @param node - Node to check.
     */
    static isConstructorTypeNode(node: Node): node is ConstructorTypeNode;
    /**
     * Gets if the node is a ContinueStatement.
     * @param node - Node to check.
     */
    static isContinueStatement(node: Node): node is ContinueStatement;
    /**
     * Gets if the node is a DebuggerStatement.
     * @param node - Node to check.
     */
    static isDebuggerStatement(node: Node): node is DebuggerStatement;
    /**
     * Gets if the node is a DeclarationNamedNode.
     * @param node - Node to check.
     */
    static isDeclarationNamedNode(node: Node): node is DeclarationNamedNode & Node;
    /**
     * Gets if the node is a DecoratableNode.
     * @param node - Node to check.
     */
    static isDecoratableNode(node: Node): node is DecoratableNode & Node;
    /**
     * Gets if the node is a Decorator.
     * @param node - Node to check.
     */
    static isDecorator(node: Node): node is Decorator;
    /**
     * Gets if the node is a DefaultClause.
     * @param node - Node to check.
     */
    static isDefaultClause(node: Node): node is DefaultClause;
    /**
     * Gets if the node is a DeleteExpression.
     * @param node - Node to check.
     */
    static isDeleteExpression(node: Node): node is DeleteExpression;
    /**
     * Gets if the node is a DoStatement.
     * @param node - Node to check.
     */
    static isDoStatement(node: Node): node is DoStatement;
    /**
     * Gets if the node is an ElementAccessExpression.
     * @param node - Node to check.
     */
    static isElementAccessExpression(node: Node): node is ElementAccessExpression;
    /**
     * Gets if the node is an EmptyStatement.
     * @param node - Node to check.
     */
    static isEmptyStatement(node: Node): node is EmptyStatement;
    /**
     * Gets if the node is an EnumDeclaration.
     * @param node - Node to check.
     */
    static isEnumDeclaration(node: Node): node is EnumDeclaration;
    /**
     * Gets if the node is an EnumMember.
     * @param node - Node to check.
     */
    static isEnumMember(node: Node): node is EnumMember;
    /**
     * Gets if the node is an ExclamationTokenableNode.
     * @param node - Node to check.
     */
    static isExclamationTokenableNode(node: Node): node is ExclamationTokenableNode & Node;
    /**
     * Gets if the node is an ExportAssignment.
     * @param node - Node to check.
     */
    static isExportAssignment(node: Node): node is ExportAssignment;
    /**
     * Gets if the node is an ExportDeclaration.
     * @param node - Node to check.
     */
    static isExportDeclaration(node: Node): node is ExportDeclaration;
    /**
     * Gets if the node is an ExportSpecifier.
     * @param node - Node to check.
     */
    static isExportSpecifier(node: Node): node is ExportSpecifier;
    /**
     * Gets if the node is an ExportableNode.
     * @param node - Node to check.
     */
    static isExportableNode(node: Node): node is ExportableNode & Node;
    /**
     * Gets if the node is an Expression.
     * @param node - Node to check.
     */
    static isExpression(node: Node): node is Expression;
    /**
     * Gets if the node is an ExpressionStatement.
     * @param node - Node to check.
     */
    static isExpressionStatement(node: Node): node is ExpressionStatement;
    /**
     * Gets if the node is an ExpressionWithTypeArguments.
     * @param node - Node to check.
     */
    static isExpressionWithTypeArguments(node: Node): node is ExpressionWithTypeArguments;
    /**
     * Gets if the node is an ExpressionedNode.
     * @param node - Node to check.
     */
    static isExpressionedNode(node: Node): node is ExpressionedNode & Node;
    /**
     * Gets if the node is an ExtendsClauseableNode.
     * @param node - Node to check.
     */
    static isExtendsClauseableNode(node: Node): node is ExtendsClauseableNode & Node;
    /**
     * Gets if the node is an ExternalModuleReference.
     * @param node - Node to check.
     */
    static isExternalModuleReference(node: Node): node is ExternalModuleReference;
    /**
     * Gets if the node is a FalseKeyword.
     * @param node - Node to check.
     */
    static isFalseKeyword(node: Node): node is BooleanLiteral;
    /**
     * Gets if the node is a ForInStatement.
     * @param node - Node to check.
     */
    static isForInStatement(node: Node): node is ForInStatement;
    /**
     * Gets if the node is a ForOfStatement.
     * @param node - Node to check.
     */
    static isForOfStatement(node: Node): node is ForOfStatement;
    /**
     * Gets if the node is a ForStatement.
     * @param node - Node to check.
     */
    static isForStatement(node: Node): node is ForStatement;
    /**
     * Gets if the node is a FunctionDeclaration.
     * @param node - Node to check.
     */
    static isFunctionDeclaration(node: Node): node is FunctionDeclaration;
    /**
     * Gets if the node is a FunctionExpression.
     * @param node - Node to check.
     */
    static isFunctionExpression(node: Node): node is FunctionExpression;
    /**
     * Gets if the node is a FunctionLikeDeclaration.
     * @param node - Node to check.
     */
    static isFunctionLikeDeclaration(node: Node): node is FunctionLikeDeclaration & Node;
    /**
     * Gets if the node is a FunctionTypeNode.
     * @param node - Node to check.
     */
    static isFunctionTypeNode(node: Node): node is FunctionTypeNode;
    /**
     * Gets if the node is a GeneratorableNode.
     * @param node - Node to check.
     */
    static isGeneratorableNode(node: Node): node is GeneratorableNode & Node;
    /**
     * Gets if the node is a GetAccessorDeclaration.
     * @param node - Node to check.
     */
    static isGetAccessorDeclaration(node: Node): node is GetAccessorDeclaration;
    /**
     * Gets if the node is a HeritageClause.
     * @param node - Node to check.
     */
    static isHeritageClause(node: Node): node is HeritageClause;
    /**
     * Gets if the node is a HeritageClauseableNode.
     * @param node - Node to check.
     */
    static isHeritageClauseableNode(node: Node): node is HeritageClauseableNode & Node;
    /**
     * Gets if the node is a Identifier.
     * @param node - Node to check.
     */
    static isIdentifier(node: Node): node is Identifier;
    /**
     * Gets if the node is a IfStatement.
     * @param node - Node to check.
     */
    static isIfStatement(node: Node): node is IfStatement;
    /**
     * Gets if the node is a ImplementsClauseableNode.
     * @param node - Node to check.
     */
    static isImplementsClauseableNode(node: Node): node is ImplementsClauseableNode & Node;
    /**
     * Gets if the node is a ImportDeclaration.
     * @param node - Node to check.
     */
    static isImportDeclaration(node: Node): node is ImportDeclaration;
    /**
     * Gets if the node is a ImportEqualsDeclaration.
     * @param node - Node to check.
     */
    static isImportEqualsDeclaration(node: Node): node is ImportEqualsDeclaration;
    /**
     * Gets if the node is a ImportExpression.
     * @param node - Node to check.
     */
    static isImportExpression(node: Node): node is ImportExpression;
    /**
     * Gets if the node is a ImportSpecifier.
     * @param node - Node to check.
     */
    static isImportSpecifier(node: Node): node is ImportSpecifier;
    /**
     * Gets if the node is a ImportTypeNode.
     * @param node - Node to check.
     */
    static isImportTypeNode(node: Node): node is ImportTypeNode;
    /**
     * Gets if the node is a IndexSignatureDeclaration.
     * @param node - Node to check.
     */
    static isIndexSignatureDeclaration(node: Node): node is IndexSignatureDeclaration;
    /**
     * Gets if the node is a InitializerExpressionableNode.
     * @param node - Node to check.
     */
    static isInitializerExpressionableNode(node: Node): node is InitializerExpressionableNode & Node;
    /**
     * Gets if the node is a InitializerGetExpressionableNode.
     * @param node - Node to check.
     */
    static isInitializerGetExpressionableNode(node: Node): node is InitializerGetExpressionableNode & Node;
    /**
     * Gets if the node is a InitializerSetExpressionableNode.
     * @param node - Node to check.
     */
    static isInitializerSetExpressionableNode(node: Node): node is InitializerSetExpressionableNode & Node;
    /**
     * Gets if the node is a InterfaceDeclaration.
     * @param node - Node to check.
     */
    static isInterfaceDeclaration(node: Node): node is InterfaceDeclaration;
    /**
     * Gets if the node is a IntersectionTypeNode.
     * @param node - Node to check.
     */
    static isIntersectionTypeNode(node: Node): node is IntersectionTypeNode;
    /**
     * Gets if the node is a IterationStatement.
     * @param node - Node to check.
     */
    static isIterationStatement(node: Node): node is IterationStatement;
    /**
     * Gets if the node is a JSDoc.
     * @param node - Node to check.
     */
    static isJSDoc(node: Node): node is JSDoc;
    /**
     * Gets if the node is a JSDocAugmentsTag.
     * @param node - Node to check.
     */
    static isJSDocAugmentsTag(node: Node): node is JSDocAugmentsTag;
    /**
     * Gets if the node is a JSDocClassTag.
     * @param node - Node to check.
     */
    static isJSDocClassTag(node: Node): node is JSDocClassTag;
    /**
     * Gets if the node is a JSDocParameterTag.
     * @param node - Node to check.
     */
    static isJSDocParameterTag(node: Node): node is JSDocParameterTag;
    /**
     * Gets if the node is a JSDocPropertyLikeTag.
     * @param node - Node to check.
     */
    static isJSDocPropertyLikeTag(node: Node): node is JSDocPropertyLikeTag & Node;
    /**
     * Gets if the node is a JSDocPropertyTag.
     * @param node - Node to check.
     */
    static isJSDocPropertyTag(node: Node): node is JSDocPropertyTag;
    /**
     * Gets if the node is a JSDocReturnTag.
     * @param node - Node to check.
     */
    static isJSDocReturnTag(node: Node): node is JSDocReturnTag;
    /**
     * Gets if the node is a JSDocTag.
     * @param node - Node to check.
     */
    static isJSDocTag(node: Node): node is JSDocTag;
    /**
     * Gets if the node is a JSDocTypeTag.
     * @param node - Node to check.
     */
    static isJSDocTypeTag(node: Node): node is JSDocTypeTag;
    /**
     * Gets if the node is a JSDocTypedefTag.
     * @param node - Node to check.
     */
    static isJSDocTypedefTag(node: Node): node is JSDocTypedefTag;
    /**
     * Gets if the node is a JSDocUnknownTag.
     * @param node - Node to check.
     */
    static isJSDocUnknownTag(node: Node): node is JSDocUnknownTag;
    /**
     * Gets if the node is a JSDocableNode.
     * @param node - Node to check.
     */
    static isJSDocableNode(node: Node): node is JSDocableNode & Node;
    /**
     * Gets if the node is a JsxAttribute.
     * @param node - Node to check.
     */
    static isJsxAttribute(node: Node): node is JsxAttribute;
    /**
     * Gets if the node is a JsxAttributedNode.
     * @param node - Node to check.
     */
    static isJsxAttributedNode(node: Node): node is JsxAttributedNode & Node;
    /**
     * Gets if the node is a JsxClosingElement.
     * @param node - Node to check.
     */
    static isJsxClosingElement(node: Node): node is JsxClosingElement;
    /**
     * Gets if the node is a JsxClosingFragment.
     * @param node - Node to check.
     */
    static isJsxClosingFragment(node: Node): node is JsxClosingFragment;
    /**
     * Gets if the node is a JsxElement.
     * @param node - Node to check.
     */
    static isJsxElement(node: Node): node is JsxElement;
    /**
     * Gets if the node is a JsxExpression.
     * @param node - Node to check.
     */
    static isJsxExpression(node: Node): node is JsxExpression;
    /**
     * Gets if the node is a JsxFragment.
     * @param node - Node to check.
     */
    static isJsxFragment(node: Node): node is JsxFragment;
    /**
     * Gets if the node is a JsxOpeningElement.
     * @param node - Node to check.
     */
    static isJsxOpeningElement(node: Node): node is JsxOpeningElement;
    /**
     * Gets if the node is a JsxOpeningFragment.
     * @param node - Node to check.
     */
    static isJsxOpeningFragment(node: Node): node is JsxOpeningFragment;
    /**
     * Gets if the node is a JsxSelfClosingElement.
     * @param node - Node to check.
     */
    static isJsxSelfClosingElement(node: Node): node is JsxSelfClosingElement;
    /**
     * Gets if the node is a JsxSpreadAttribute.
     * @param node - Node to check.
     */
    static isJsxSpreadAttribute(node: Node): node is JsxSpreadAttribute;
    /**
     * Gets if the node is a JsxTagNamedNode.
     * @param node - Node to check.
     */
    static isJsxTagNamedNode(node: Node): node is JsxTagNamedNode & Node;
    /**
     * Gets if the node is a JsxText.
     * @param node - Node to check.
     */
    static isJsxText(node: Node): node is JsxText;
    /**
     * Gets if the node is a LabeledStatement.
     * @param node - Node to check.
     */
    static isLabeledStatement(node: Node): node is LabeledStatement;
    /**
     * Gets if the node is a LeftHandSideExpression.
     * @param node - Node to check.
     */
    static isLeftHandSideExpression(node: Node): node is LeftHandSideExpression;
    /**
     * Gets if the node is a LeftHandSideExpressionedNode.
     * @param node - Node to check.
     */
    static isLeftHandSideExpressionedNode(node: Node): node is LeftHandSideExpressionedNode & Node;
    /**
     * Gets if the node is a LiteralExpression.
     * @param node - Node to check.
     */
    static isLiteralExpression(node: Node): node is LiteralExpression;
    /**
     * Gets if the node is a LiteralLikeNode.
     * @param node - Node to check.
     */
    static isLiteralLikeNode(node: Node): node is LiteralLikeNode & Node;
    /**
     * Gets if the node is a LiteralTypeNode.
     * @param node - Node to check.
     */
    static isLiteralTypeNode(node: Node): node is LiteralTypeNode;
    /**
     * Gets if the node is a MemberExpression.
     * @param node - Node to check.
     */
    static isMemberExpression(node: Node): node is MemberExpression;
    /**
     * Gets if the node is a MetaProperty.
     * @param node - Node to check.
     */
    static isMetaProperty(node: Node): node is MetaProperty;
    /**
     * Gets if the node is a MethodDeclaration.
     * @param node - Node to check.
     */
    static isMethodDeclaration(node: Node): node is MethodDeclaration;
    /**
     * Gets if the node is a MethodSignature.
     * @param node - Node to check.
     */
    static isMethodSignature(node: Node): node is MethodSignature;
    /**
     * Gets if the node is a ModifierableNode.
     * @param node - Node to check.
     */
    static isModifierableNode(node: Node): node is ModifierableNode & Node;
    /**
     * Gets if the node is a NameableNode.
     * @param node - Node to check.
     */
    static isNameableNode(node: Node): node is NameableNode & Node;
    /**
     * Gets if the node is a NamedNode.
     * @param node - Node to check.
     */
    static isNamedNode(node: Node): node is NamedNode & Node;
    /**
     * Gets if the node is a NamespaceChildableNode.
     * @param node - Node to check.
     */
    static isNamespaceChildableNode(node: Node): node is NamespaceChildableNode & Node;
    /**
     * Gets if the node is a NamespaceDeclaration.
     * @param node - Node to check.
     */
    static isNamespaceDeclaration(node: Node): node is NamespaceDeclaration;
    /**
     * Gets if the node is a NeverKeyword.
     * @param node - Node to check.
     */
    static isNeverKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is a NewExpression.
     * @param node - Node to check.
     */
    static isNewExpression(node: Node): node is NewExpression;
    /**
     * Gets if the node is a NoSubstitutionTemplateLiteral.
     * @param node - Node to check.
     */
    static isNoSubstitutionTemplateLiteral(node: Node): node is NoSubstitutionTemplateLiteral;
    /**
     * Gets if the node is a NonNullExpression.
     * @param node - Node to check.
     */
    static isNonNullExpression(node: Node): node is NonNullExpression;
    /**
     * Gets if the node is a NotEmittedStatement.
     * @param node - Node to check.
     */
    static isNotEmittedStatement(node: Node): node is NotEmittedStatement;
    /**
     * Gets if the node is a NullLiteral.
     * @param node - Node to check.
     */
    static isNullLiteral(node: Node): node is NullLiteral;
    /**
     * Gets if the node is a NumberKeyword.
     * @param node - Node to check.
     */
    static isNumberKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is a NumericLiteral.
     * @param node - Node to check.
     */
    static isNumericLiteral(node: Node): node is NumericLiteral;
    /**
     * Gets if the node is a ObjectKeyword.
     * @param node - Node to check.
     */
    static isObjectKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is a ObjectLiteralExpression.
     * @param node - Node to check.
     */
    static isObjectLiteralExpression(node: Node): node is ObjectLiteralExpression;
    /**
     * Gets if the node is a OmittedExpression.
     * @param node - Node to check.
     */
    static isOmittedExpression(node: Node): node is OmittedExpression;
    /**
     * Gets if the node is a OverloadableNode.
     * @param node - Node to check.
     */
    static isOverloadableNode(node: Node): node is OverloadableNode & Node;
    /**
     * Gets if the node is a ParameterDeclaration.
     * @param node - Node to check.
     */
    static isParameterDeclaration(node: Node): node is ParameterDeclaration;
    /**
     * Gets if the node is a ParameteredNode.
     * @param node - Node to check.
     */
    static isParameteredNode(node: Node): node is ParameteredNode & Node;
    /**
     * Gets if the node is a ParenthesizedExpression.
     * @param node - Node to check.
     */
    static isParenthesizedExpression(node: Node): node is ParenthesizedExpression;
    /**
     * Gets if the node is a PartiallyEmittedExpression.
     * @param node - Node to check.
     */
    static isPartiallyEmittedExpression(node: Node): node is PartiallyEmittedExpression;
    /**
     * Gets if the node is a PostfixUnaryExpression.
     * @param node - Node to check.
     */
    static isPostfixUnaryExpression(node: Node): node is PostfixUnaryExpression;
    /**
     * Gets if the node is a PrefixUnaryExpression.
     * @param node - Node to check.
     */
    static isPrefixUnaryExpression(node: Node): node is PrefixUnaryExpression;
    /**
     * Gets if the node is a PrimaryExpression.
     * @param node - Node to check.
     */
    static isPrimaryExpression(node: Node): node is PrimaryExpression;
    /**
     * Gets if the node is a PropertyAccessExpression.
     * @param node - Node to check.
     */
    static isPropertyAccessExpression(node: Node): node is PropertyAccessExpression;
    /**
     * Gets if the node is a PropertyAssignment.
     * @param node - Node to check.
     */
    static isPropertyAssignment(node: Node): node is PropertyAssignment;
    /**
     * Gets if the node is a PropertyDeclaration.
     * @param node - Node to check.
     */
    static isPropertyDeclaration(node: Node): node is PropertyDeclaration;
    /**
     * Gets if the node is a PropertyNamedNode.
     * @param node - Node to check.
     */
    static isPropertyNamedNode(node: Node): node is PropertyNamedNode & Node;
    /**
     * Gets if the node is a PropertySignature.
     * @param node - Node to check.
     */
    static isPropertySignature(node: Node): node is PropertySignature;
    /**
     * Gets if the node is a QualifiedName.
     * @param node - Node to check.
     */
    static isQualifiedName(node: Node): node is QualifiedName;
    /**
     * Gets if the node is a QuestionTokenableNode.
     * @param node - Node to check.
     */
    static isQuestionTokenableNode(node: Node): node is QuestionTokenableNode & Node;
    /**
     * Gets if the node is a ReadonlyableNode.
     * @param node - Node to check.
     */
    static isReadonlyableNode(node: Node): node is ReadonlyableNode & Node;
    /**
     * Gets if the node is a ReferenceFindableNode.
     * @param node - Node to check.
     */
    static isReferenceFindableNode(node: Node): node is ReferenceFindableNode & Node;
    /**
     * Gets if the node is a RegularExpressionLiteral.
     * @param node - Node to check.
     */
    static isRegularExpressionLiteral(node: Node): node is RegularExpressionLiteral;
    /**
     * Gets if the node is a ReturnStatement.
     * @param node - Node to check.
     */
    static isReturnStatement(node: Node): node is ReturnStatement;
    /**
     * Gets if the node is a ReturnTypedNode.
     * @param node - Node to check.
     */
    static isReturnTypedNode(node: Node): node is ReturnTypedNode & Node;
    /**
     * Gets if the node is a ScopeableNode.
     * @param node - Node to check.
     */
    static isScopeableNode(node: Node): node is ScopeableNode & Node;
    /**
     * Gets if the node is a ScopedNode.
     * @param node - Node to check.
     */
    static isScopedNode(node: Node): node is ScopedNode & Node;
    /**
     * Gets if the node is a SemicolonToken.
     * @param node - Node to check.
     */
    static isSemicolonToken(node: Node): node is Node;
    /**
     * Gets if the node is a SetAccessorDeclaration.
     * @param node - Node to check.
     */
    static isSetAccessorDeclaration(node: Node): node is SetAccessorDeclaration;
    /**
     * Gets if the node is a ShorthandPropertyAssignment.
     * @param node - Node to check.
     */
    static isShorthandPropertyAssignment(node: Node): node is ShorthandPropertyAssignment;
    /**
     * Gets if the node is a SignaturedDeclaration.
     * @param node - Node to check.
     */
    static isSignaturedDeclaration(node: Node): node is SignaturedDeclaration & Node;
    /**
     * Gets if the node is a SourceFile.
     * @param node - Node to check.
     */
    static isSourceFile(node: Node): node is SourceFile;
    /**
     * Gets if the node is a SpreadAssignment.
     * @param node - Node to check.
     */
    static isSpreadAssignment(node: Node): node is SpreadAssignment;
    /**
     * Gets if the node is a SpreadElement.
     * @param node - Node to check.
     */
    static isSpreadElement(node: Node): node is SpreadElement;
    /**
     * Gets if the node is a Statement.
     * @param node - Node to check.
     */
    static isStatement(node: Node): node is Statement;
    /**
     * Gets if the node is a StatementedNode.
     * @param node - Node to check.
     */
    static isStatementedNode(node: Node): node is StatementedNode & Node;
    /**
     * Gets if the node is a StaticableNode.
     * @param node - Node to check.
     */
    static isStaticableNode(node: Node): node is StaticableNode & Node;
    /**
     * Gets if the node is a StringKeyword.
     * @param node - Node to check.
     */
    static isStringKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is a StringLiteral.
     * @param node - Node to check.
     */
    static isStringLiteral(node: Node): node is StringLiteral;
    /**
     * Gets if the node is a SuperExpression.
     * @param node - Node to check.
     */
    static isSuperExpression(node: Node): node is SuperExpression;
    /**
     * Gets if the node is a SwitchStatement.
     * @param node - Node to check.
     */
    static isSwitchStatement(node: Node): node is SwitchStatement;
    /**
     * Gets if the node is a SymbolKeyword.
     * @param node - Node to check.
     */
    static isSymbolKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is a SyntaxList.
     * @param node - Node to check.
     */
    static isSyntaxList(node: Node): node is SyntaxList;
    /**
     * Gets if the node is a TaggedTemplateExpression.
     * @param node - Node to check.
     */
    static isTaggedTemplateExpression(node: Node): node is TaggedTemplateExpression;
    /**
     * Gets if the node is a TemplateExpression.
     * @param node - Node to check.
     */
    static isTemplateExpression(node: Node): node is TemplateExpression;
    /**
     * Gets if the node is a TemplateHead.
     * @param node - Node to check.
     */
    static isTemplateHead(node: Node): node is TemplateHead;
    /**
     * Gets if the node is a TemplateMiddle.
     * @param node - Node to check.
     */
    static isTemplateMiddle(node: Node): node is TemplateMiddle;
    /**
     * Gets if the node is a TemplateSpan.
     * @param node - Node to check.
     */
    static isTemplateSpan(node: Node): node is TemplateSpan;
    /**
     * Gets if the node is a TemplateTail.
     * @param node - Node to check.
     */
    static isTemplateTail(node: Node): node is TemplateTail;
    /**
     * Gets if the node is a TextInsertableNode.
     * @param node - Node to check.
     */
    static isTextInsertableNode(node: Node): node is TextInsertableNode & Node;
    /**
     * Gets if the node is a ThisExpression.
     * @param node - Node to check.
     */
    static isThisExpression(node: Node): node is ThisExpression;
    /**
     * Gets if the node is a ThrowStatement.
     * @param node - Node to check.
     */
    static isThrowStatement(node: Node): node is ThrowStatement;
    /**
     * Gets if the node is a TrueKeyword.
     * @param node - Node to check.
     */
    static isTrueKeyword(node: Node): node is BooleanLiteral;
    /**
     * Gets if the node is a TryStatement.
     * @param node - Node to check.
     */
    static isTryStatement(node: Node): node is TryStatement;
    /**
     * Gets if the node is a TupleTypeNode.
     * @param node - Node to check.
     */
    static isTupleTypeNode(node: Node): node is TupleTypeNode;
    /**
     * Gets if the node is a TypeAliasDeclaration.
     * @param node - Node to check.
     */
    static isTypeAliasDeclaration(node: Node): node is TypeAliasDeclaration;
    /**
     * Gets if the node is a TypeArgumentedNode.
     * @param node - Node to check.
     */
    static isTypeArgumentedNode(node: Node): node is TypeArgumentedNode & Node;
    /**
     * Gets if the node is a TypeAssertion.
     * @param node - Node to check.
     */
    static isTypeAssertion(node: Node): node is TypeAssertion;
    /**
     * Gets if the node is a TypeElement.
     * @param node - Node to check.
     */
    static isTypeElement(node: Node): node is TypeElement;
    /**
     * Gets if the node is a TypeElementMemberedNode.
     * @param node - Node to check.
     */
    static isTypeElementMemberedNode(node: Node): node is TypeElementMemberedNode & Node;
    /**
     * Gets if the node is a TypeLiteralNode.
     * @param node - Node to check.
     */
    static isTypeLiteralNode(node: Node): node is TypeLiteralNode;
    /**
     * Gets if the node is a TypeNode.
     * @param node - Node to check.
     */
    static isTypeNode(node: Node): node is TypeNode;
    /**
     * Gets if the node is a TypeOfExpression.
     * @param node - Node to check.
     */
    static isTypeOfExpression(node: Node): node is TypeOfExpression;
    /**
     * Gets if the node is a TypeParameterDeclaration.
     * @param node - Node to check.
     */
    static isTypeParameterDeclaration(node: Node): node is TypeParameterDeclaration;
    /**
     * Gets if the node is a TypeParameteredNode.
     * @param node - Node to check.
     */
    static isTypeParameteredNode(node: Node): node is TypeParameteredNode & Node;
    /**
     * Gets if the node is a TypeReferenceNode.
     * @param node - Node to check.
     */
    static isTypeReferenceNode(node: Node): node is TypeReferenceNode;
    /**
     * Gets if the node is a TypedNode.
     * @param node - Node to check.
     */
    static isTypedNode(node: Node): node is TypedNode & Node;
    /**
     * Gets if the node is a UnaryExpression.
     * @param node - Node to check.
     */
    static isUnaryExpression(node: Node): node is UnaryExpression;
    /**
     * Gets if the node is a UnaryExpressionedNode.
     * @param node - Node to check.
     */
    static isUnaryExpressionedNode(node: Node): node is UnaryExpressionedNode & Node;
    /**
     * Gets if the node is a UndefinedKeyword.
     * @param node - Node to check.
     */
    static isUndefinedKeyword(node: Node): node is Expression;
    /**
     * Gets if the node is a UnionTypeNode.
     * @param node - Node to check.
     */
    static isUnionTypeNode(node: Node): node is UnionTypeNode;
    /**
     * Gets if the node is a UnwrappableNode.
     * @param node - Node to check.
     */
    static isUnwrappableNode(node: Node): node is UnwrappableNode & Node;
    /**
     * Gets if the node is a UpdateExpression.
     * @param node - Node to check.
     */
    static isUpdateExpression(node: Node): node is UpdateExpression;
    /**
     * Gets if the node is a VariableDeclaration.
     * @param node - Node to check.
     */
    static isVariableDeclaration(node: Node): node is VariableDeclaration;
    /**
     * Gets if the node is a VariableDeclarationList.
     * @param node - Node to check.
     */
    static isVariableDeclarationList(node: Node): node is VariableDeclarationList;
    /**
     * Gets if the node is a VariableStatement.
     * @param node - Node to check.
     */
    static isVariableStatement(node: Node): node is VariableStatement;
    /**
     * Gets if the node is a VoidExpression.
     * @param node - Node to check.
     */
    static isVoidExpression(node: Node): node is VoidExpression;
    /**
     * Gets if the node is a WhileStatement.
     * @param node - Node to check.
     */
    static isWhileStatement(node: Node): node is WhileStatement;
    /**
     * Gets if the node is a WithStatement.
     * @param node - Node to check.
     */
    static isWithStatement(node: Node): node is WithStatement;
    /**
     * Gets if the node is a YieldExpression.
     * @param node - Node to check.
     */
    static isYieldExpression(node: Node): node is YieldExpression;
}

export declare type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;

export declare type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;

export declare type EntityName = Identifier | QualifiedName;

export declare type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;

export declare type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;

export declare type JsxTagNameExpression = PrimaryExpression | PropertyAccessExpression;

export declare type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;

export declare type CaseOrDefaultClause = CaseClause | DefaultClause;

export declare type ModuleReference = EntityName | ExternalModuleReference;

export declare type TypeElementTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration | IndexSignatureDeclaration;

export declare type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;

export declare function AmbientableNode<T extends Constructor<AmbientableNodeExtensionType>>(Base: T): Constructor<AmbientableNode> & T;

export interface AmbientableNode {
    /**
     * If the node has the declare keyword.
     */
    hasDeclareKeyword(): boolean;
    /**
     * Gets the declare keyword or undefined if none exists.
     */
    getDeclareKeyword(): Node | undefined;
    /**
     * Gets the declare keyword or throws if it doesn't exist.
     */
    getDeclareKeywordOrThrow(): Node;
    /**
     * Gets if the node is ambient.
     */
    isAmbient(): boolean;
    /**
     * Sets if this node has a declare keyword.
     * @param value - To add the declare keyword or not.
     */
    setHasDeclareKeyword(value?: boolean): this;
}

export declare type AmbientableNodeExtensionType = Node & ModifierableNode;

export declare function ArgumentedNode<T extends Constructor<ArgumentedNodeExtensionType>>(Base: T): Constructor<ArgumentedNode> & T;

export interface ArgumentedNode {
    /**
     * Gets all the arguments of the node.
     */
    getArguments(): Node[];
    /**
     * Adds an argument.
     * @param argumentText - Argument text to add.
     */
    addArgument(argumentText: string | WriterFunction): Node;
    /**
     * Adds arguments.
     * @param argumentTexts - Argument texts to add.
     */
    addArguments(argumentTexts: (string | WriterFunction)[]): Node[];
    /**
     * Inserts an argument.
     * @param index - Index to insert at.
     * @param argumentText - Argument text to insert.
     */
    insertArgument(index: number, argumentText: string | WriterFunction): Node;
    /**
     * Inserts arguments.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument texts to insert.
     */
    insertArguments(index: number, argumentTexts: (string | WriterFunction)[]): Node[];
    /**
     * Removes an argument.
     * @param arg - Argument to remove.
     */
    removeArgument(arg: Node): this;
    /**
     * Removes an argument.
     * @param index - Index to remove.
     */
    removeArgument(index: number): this;
}

export declare type ArgumentedNodeExtensionType = Node<ts.Node & {
    arguments: ts.NodeArray<ts.Node>;
}>;

export declare function AsyncableNode<T extends Constructor<AsyncableNodeExtensionType>>(Base: T): Constructor<AsyncableNode> & T;

export interface AsyncableNode {
    /**
     * If it's async.
     */
    isAsync(): boolean;
    /**
     * Gets the async keyword or undefined if none exists.
     */
    getAsyncKeyword(): Node<ts.Modifier> | undefined;
    /**
     * Gets the async keyword or throws if none exists.
     */
    getAsyncKeywordOrThrow(): Node<ts.Modifier>;
    /**
     * Sets if the node is async.
     * @param value - If it should be async or not.
     */
    setIsAsync(value: boolean): this;
}

export declare type AsyncableNodeExtensionType = Node & ModifierableNode;

export declare function AwaitableNode<T extends Constructor<AwaitableNodeExtensionType>>(Base: T): Constructor<AwaitableNode> & T;

export interface AwaitableNode {
    /**
     * If it's an awaited node.
     */
    isAwaited(): boolean;
    /**
     * Gets the await token or undefined if none exists.
     */
    getAwaitKeyword(): Node<ts.AwaitKeywordToken> | undefined;
    /**
     * Gets the await token or throws if none exists.
     */
    getAwaitKeywordOrThrow(): Node<ts.AwaitKeywordToken>;
    /**
     * Sets if the node is awaited.
     * @param value - If it should be awaited or not.
     */
    setIsAwaited(value: boolean): this;
}

export declare type AwaitableNodeExtensionType = Node<ts.Node & {
    awaitModifier?: ts.AwaitKeywordToken;
}>;

export declare function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T;

export interface BodiedNode {
    /**
     * Gets the body.
     */
    getBody(): Node;
    /**
     * Sets the body text.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: WriterFunction): this;
    /**
     * Sets the body text.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
}

export declare type BodiedNodeExtensionType = Node<ts.Node & {
    body: ts.Node;
}>;

export declare function BodyableNode<T extends Constructor<BodyableNodeExtensionType>>(Base: T): Constructor<BodyableNode> & T;

export interface BodyableNode {
    /**
     * Gets the body or throws an error if it doesn't exist.
     */
    getBodyOrThrow(): Node;
    /**
     * Gets the body if it exists.
     */
    getBody(): Node | undefined;
    /**
     * Gets if the node has a body.
     */
    hasBody(): boolean;
    /**
     * Sets the body text. A body is required to do this operation.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: WriterFunction): this;
    /**
     * Sets the body text. A body is required to do this operation.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
    /**
     * Adds a body if it doesn't exists.
     */
    addBody(): this;
    /**
     * Removes the body if it exists.
     */
    removeBody(): this;
}

export declare type BodyableNodeExtensionType = Node<ts.Node & {
    body?: ts.Node;
}>;

export declare function ChildOrderableNode<T extends Constructor<Node>>(Base: T): Constructor<ChildOrderableNode> & T;

export interface ChildOrderableNode {
    /**
     * Sets the child order of the node within the parent.
     */
    setOrder(order: number): this;
}

export declare function DecoratableNode<T extends Constructor<DecoratableNodeExtensionType>>(Base: T): Constructor<DecoratableNode> & T;

export interface DecoratableNode {
    /**
     * Gets a decorator or undefined if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getDecorator(name: string): Decorator | undefined;
    /**
     * Gets a decorator or undefined if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getDecorator(findFunction: (declaration: Decorator) => boolean): Decorator | undefined;
    /**
     * Gets a decorator or throws if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getDecoratorOrThrow(name: string): Decorator;
    /**
     * Gets a decorator or throws if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getDecoratorOrThrow(findFunction: (declaration: Decorator) => boolean): Decorator;
    /**
     * Gets all the decorators of the node.
     */
    getDecorators(): Decorator[];
    /**
     * Adds a decorator.
     * @param structure - Structure of the decorator.
     */
    addDecorator(structure: DecoratorStructure): Decorator;
    /**
     * Adds decorators.
     * @param structures - Structures of the decorators.
     */
    addDecorators(structures: DecoratorStructure[]): Decorator[];
    /**
     * Inserts a decorator.
     * @param index - Index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the decorator.
     */
    insertDecorator(index: number, structure: DecoratorStructure): Decorator;
    /**
     * Insert decorators.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertDecorators(index: number, structures: DecoratorStructure[]): Decorator[];
}

export declare type DecoratableNodeExtensionType = Node<ts.Node & {
    decorators: ts.NodeArray<ts.Decorator> | undefined;
}>;

export declare function ExclamationTokenableNode<T extends Constructor<ExclamationTokenableNodeExtensionType>>(Base: T): Constructor<ExclamationTokenableNode> & T;

export interface ExclamationTokenableNode {
    /**
     * If it has a exclamation token.
     */
    hasExclamationToken(): boolean;
    /**
     * Gets the exclamation token node or returns undefined if it doesn't exist.
     */
    getExclamationTokenNode(): Node<ts.ExclamationToken> | undefined;
    /**
     * Gets the exclamation token node or throws.
     */
    getExclamationTokenNodeOrThrow(): Node<ts.ExclamationToken>;
    /**
     * Sets if this node has a exclamation token.
     * @param value - If it should have a exclamation token or not.
     */
    setHasExclamationToken(value: boolean): this;
}

export declare type ExclamationTokenableNodeExtensionType = Node<ts.Node & {
    exclamationToken?: ts.ExclamationToken;
}>;

export declare function ExportableNode<T extends Constructor<ExportableNodeExtensionType>>(Base: T): Constructor<ExportableNode> & T;

export interface ExportableNode {
    /**
     * If the node has the export keyword.
     */
    hasExportKeyword(): boolean;
    /**
     * Gets the export keyword or undefined if none exists.
     */
    getExportKeyword(): Node | undefined;
    /**
     * Gets the export keyword or throws if none exists.
     */
    getExportKeywordOrThrow(): Node;
    /**
     * If the node has the default keyword.
     */
    hasDefaultKeyword(): boolean;
    /**
     * Gets the default keyword or undefined if none exists.
     */
    getDefaultKeyword(): Node | undefined;
    /**
     * Gets the default keyword or throws if none exists.
     */
    getDefaultKeywordOrThrow(): Node;
    /**
     * Gets if the node is exported from a namespace, is a default export, or is a named export.
     */
    isExported(): boolean;
    /**
     * Gets if this node is a default export of a file.
     */
    isDefaultExport(): boolean;
    /**
     * Gets if this node is a named export of a file.
     */
    isNamedExport(): boolean;
    /**
     * Sets if this node is a default export of a file.
     * @param value - If it should be a default export or not.
     */
    setIsDefaultExport(value: boolean): this;
    /**
     * Sets if the node is exported.
     *
     * Note: Will remove the default keyword if set.
     * @param value - If it should be exported or not.
     */
    setIsExported(value: boolean): this;
}

export declare type ExportableNodeExtensionType = Node & ModifierableNode;

export declare function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T;

export interface ExtendsClauseableNode {
    /**
     * Gets the extends clauses.
     */
    getExtends(): ExpressionWithTypeArguments[];
    /**
     * Adds multiple extends clauses.
     * @param texts - Texts to add for the extends clause.
     */
    addExtends(texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Adds an extends clause.
     * @param text - Text to add for the extends clause.
     */
    addExtends(text: string): ExpressionWithTypeArguments;
    /**
     * Inserts multiple extends clauses.
     * @param texts - Texts to insert for the extends clause.
     */
    insertExtends(index: number, texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Inserts an extends clause.
     * @param text - Text to insert for the extends clause.
     */
    insertExtends(index: number, text: string): ExpressionWithTypeArguments;
    /**
     * Removes the extends at the specified index.
     * @param index - Index to remove.
     */
    removeExtends(index: number): this;
    /**
     * Removes the specified extends.
     * @param extendsNode - Node of the extend to remove.
     */
    removeExtends(extendsNode: ExpressionWithTypeArguments): this;
}

export declare type ExtendsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export declare function GeneratorableNode<T extends Constructor<GeneratorableNodeExtensionType>>(Base: T): Constructor<GeneratorableNode> & T;

export interface GeneratorableNode {
    /**
     * If it's a generator function.
     */
    isGenerator(): boolean;
    /**
     * Gets the asterisk token or undefined if none exists.
     */
    getAsteriskToken(): Node<ts.AsteriskToken> | undefined;
    /**
     * Gets the asterisk token or throws if none exists.
     */
    getAsteriskTokenOrThrow(): Node<ts.AsteriskToken>;
    /**
     * Sets if the node is a generator.
     * @param value - If it should be a generator or not.
     */
    setIsGenerator(value: boolean): this;
}

export declare type GeneratorableNodeExtensionType = Node<ts.Node & {
    asteriskToken?: ts.AsteriskToken;
}>;

export declare function HeritageClauseableNode<T extends Constructor<HeritageClauseableNodeExtensionType>>(Base: T): Constructor<HeritageClauseableNode> & T;

export interface HeritageClauseableNode {
    /**
     * Gets the heritage clauses of the node.
     */
    getHeritageClauses(): HeritageClause[];
    /**
     * Gets the heritage clause by kind.
     * @kind - Kind of heritage clause.
     */
    getHeritageClauseByKind(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword): HeritageClause | undefined;
    /**
     * Gets the heritage clause by kind or throws if it doesn't exist.
     * @kind - Kind of heritage clause.
     */
    getHeritageClauseByKindOrThrow(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword): HeritageClause;
}

export declare type HeritageClauseableNodeExtensionType = Node<ts.Node & {
    heritageClauses?: ts.NodeArray<ts.HeritageClause>;
}>;

export declare function ImplementsClauseableNode<T extends Constructor<ImplementsClauseableNodeExtensionType>>(Base: T): Constructor<ImplementsClauseableNode> & T;

export interface ImplementsClauseableNode {
    /**
     * Gets the implements clauses.
     */
    getImplements(): ExpressionWithTypeArguments[];
    /**
     * Adds an implements clause.
     * @param text - Text to add for the implements clause.
     */
    addImplements(text: string): ExpressionWithTypeArguments;
    /**
     * Adds multiple implements clauses.
     * @param text - Texts to add for the implements clause.
     */
    addImplements(text: string[]): ExpressionWithTypeArguments[];
    /**
     * Inserts an implements clause.
     * @param text - Text to insert for the implements clause.
     */
    insertImplements(index: number, texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Inserts multiple implements clauses.
     * @param text - Texts to insert for the implements clause.
     */
    insertImplements(index: number, text: string): ExpressionWithTypeArguments;
    /**
     * Removes the implements at the specified index.
     * @param index - Index to remove.
     */
    removeImplements(index: number): this;
    /**
     * Removes the specified implements.
     * @param implementsNode - Node of the implements to remove.
     */
    removeImplements(implementsNode: ExpressionWithTypeArguments): this;
}

export declare type ImplementsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export declare function InitializerExpressionableNode<T extends Constructor<InitializerExpressionableExtensionType>>(Base: T): Constructor<InitializerExpressionableNode> & T;

export interface InitializerExpressionableNode extends InitializerGetExpressionableNode, InitializerSetExpressionableNode {
}

export declare type InitializerExpressionableExtensionType = Node<ts.Node & {
    initializer?: ts.Expression;
}>;

export declare function InitializerGetExpressionableNode<T extends Constructor<InitializerGetExpressionableExtensionType>>(Base: T): Constructor<InitializerGetExpressionableNode> & T;

export interface InitializerGetExpressionableNode {
    /**
     * Gets if node has an initializer.
     */
    hasInitializer(): boolean;
    /**
     * Gets the initializer.
     */
    getInitializer(): Expression | undefined;
    /**
     * Gets the initializer if it's a certain kind or throws.
     */
    getInitializerIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
    /**
     * Gets the initializer if it's a certain kind.
     */
    getInitializerIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
    /**
     * Gets the initializer or throw.
     */
    getInitializerOrThrow(): Expression;
}

export declare type InitializerGetExpressionableExtensionType = Node<ts.Node & {
    initializer?: ts.Expression;
}>;

export declare function InitializerSetExpressionableNode<T extends Constructor<InitializerSetExpressionableExtensionType>>(Base: T): Constructor<InitializerSetExpressionableNode> & T;

export interface InitializerSetExpressionableNode {
    /**
     * Removes the initailizer.
     */
    removeInitializer(): this;
    /**
     * Sets the initializer.
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): this;
    /**
     * Sets the initializer using a writer function.
     * @param writerFunction - Function to write the initializer with.
     */
    setInitializer(writerFunction: WriterFunction): this;
}

export declare type InitializerSetExpressionableExtensionType = Node<ts.Node & {
    initializer?: ts.Expression;
}> & InitializerGetExpressionableNode;

export declare function JSDocableNode<T extends Constructor<JSDocableNodeExtensionType>>(Base: T): Constructor<JSDocableNode> & T;

export interface JSDocableNode {
    /**
     * Gets the JS doc nodes.
     */
    getJsDocs(): JSDoc[];
    /**
     * Adds a JS doc.
     * @param structure - Structure to add.
     */
    addJsDoc(structure: JSDocStructure | string): JSDoc;
    /**
     * Adds JS docs.
     * @param structures - Structures to add.
     */
    addJsDocs(structures: (JSDocStructure | string)[]): JSDoc[];
    /**
     * Inserts a JS doc.
     * @param index - Index to insert at.
     * @param structure - Structure to insert.
     */
    insertJsDoc(index: number, structure: JSDocStructure | string): JSDoc;
    /**
     * Inserts JS docs.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertJsDocs(index: number, structures: (JSDocStructure | string)[]): JSDoc[];
}

export declare type JSDocableNodeExtensionType = Node<ts.Node & {
    jsDoc?: ts.NodeArray<ts.JSDoc>;
}>;

export declare function LiteralLikeNode<T extends Constructor<LiteralLikeNodeExtensionType>>(Base: T): Constructor<LiteralLikeNode> & T;

export interface LiteralLikeNode {
    /**
     * Get text of the literal.
     */
    getLiteralText(): string;
    /**
     * Gets if the literal is terminated.
     */
    isTerminated(): boolean;
    /**
     * Gets if the literal has an extended unicode escape.
     */
    hasExtendedUnicodeEscape(): boolean;
}

export declare type LiteralLikeNodeExtensionType = Node<ts.LiteralLikeNode>;

export declare function ModifierableNode<T extends Constructor<ModiferableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T;

export interface ModifierableNode {
    /**
     * Gets the node's modifiers.
     */
    getModifiers(): Node[];
    /**
     * Gets the first modifier of the specified syntax kind or throws if none found.
     * @param kind - Syntax kind.
     */
    getFirstModifierByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the first modifier of the specified syntax kind or undefined if none found.
     * @param kind - Syntax kind.
     */
    getFirstModifierByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets if it has the specified modifier.
     * @param kind - Syntax kind to check for.
     */
    hasModifier(kind: SyntaxKind): boolean;
    /**
     * Gets if it has the specified modifier.
     * @param text - Text to check for.
     */
    hasModifier(text: ModifierTexts): boolean;
    /**
     * Toggles a modifier.
     * @param text - Text to toggle the modifier for.
     * @param value - Optional toggling value.
     */
    toggleModifier(text: ModifierTexts, value?: boolean): this;
}

export declare type ModiferableNodeExtensionType = Node;

export declare type ModifierTexts = "export" | "default" | "declare" | "abstract" | "public" | "protected" | "private" | "readonly" | "static" | "async" | "const";

export declare function BindingNamedNode<T extends Constructor<BindingNamedNodeExtensionType>>(Base: T): Constructor<BindingNamedNode> & T;

export interface BindingNamedNode extends BindingNamedNodeSpecific, ReferenceFindableNode {
}

export declare type BindingNamedNodeExtensionType = Node<ts.Declaration & {
    name: ts.BindingName;
}>;

export interface BindingNamedNodeSpecific {
    /**
     * Gets the declaration's name node.
     */
    getNameNode(): Identifier;
    /**
     * Gets the declaration's name as a string.
     */
    getName(): string;
    /**
     * Renames the name.
     * @param text - New name.
     */
    rename(text: string): this;
}

export declare function DeclarationNamedNode<T extends Constructor<DeclarationNamedNodeExtensionType>>(Base: T): Constructor<DeclarationNamedNode> & T;

export interface DeclarationNamedNode extends DeclarationNamedNodeSpecific, ReferenceFindableNode {
}

export declare type DeclarationNamedNodeExtensionType = Node<ts.NamedDeclaration>;

export interface DeclarationNamedNodeSpecific {
    /**
     * Gets the name node.
     */
    getNameNode(): Identifier | undefined;
    /**
     * Gets the name node or throws an error if it doesn't exists.
     */
    getNameNodeOrThrow(): Identifier;
    /**
     * Gets the name.
     */
    getName(): string | undefined;
    /**
     * Gets the name or throws if it doens't exist.
     */
    getNameOrThrow(): string;
    /**
     * Renames the name.
     * @param text - Text to set as the name.
     */
    rename(text: string): this;
}

export declare function NameableNode<T extends Constructor<NameableNodeExtensionType>>(Base: T): Constructor<NameableNode> & T;

export interface NameableNode extends NameableNodeSpecific, ReferenceFindableNode {
}

export declare type NameableNodeExtensionType = Node<ts.Node & {
    name?: ts.Identifier;
}>;

export interface NameableNodeSpecific {
    /**
     * Gets the name node if it exists.
     */
    getNameNode(): Identifier | undefined;
    /**
     * Gets the name node if it exists, or throws.
     */
    getNameNodeOrThrow(): Identifier;
    /**
     * Gets the name if it exists.
     */
    getName(): string | undefined;
    /**
     * Gets the name if it exists, or throws.
     */
    getNameOrThrow(): string;
    /**
     * Renames the name or sets the name if it doesn't exist.
     * @param newName - New name.
     */
    rename(newName: string): this;
}

export declare function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T;

export interface NamedNode extends NamedNodeSpecific, ReferenceFindableNode {
}

export declare function NamedNodeInternal<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNodeSpecific> & T;

export declare type NamedNodeExtensionType = Node<ts.Node & {
    name: ts.Identifier;
}>;

export interface NamedNodeSpecific {
    /**
     * Gets the name node.
     */
    getNameNode(): Identifier;
    /**
     * Gets the name.
     */
    getName(): string;
    /**
     * Renames the name.
     * @param newName - New name.
     */
    rename(newName: string): this;
}

export declare function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T;

export interface PropertyNamedNode extends PropertyNamedNodeSpecific, ReferenceFindableNode {
}

export declare type PropertyNamedNodeExtensionType = Node<ts.Node & {
    name: ts.PropertyName;
}>;

export interface PropertyNamedNodeSpecific {
    getNameNode(): PropertyName;
    getName(): string;
    rename(text: string): this;
}

export declare function ReferenceFindableNode<T extends Constructor<ReferenceFindableNodeExtensionType>>(Base: T): Constructor<ReferenceFindableNode> & T;

export interface ReferenceFindableNode {
    /**
     * Finds the references of the definition of the node.
     */
    findReferences(): ReferencedSymbol[];
    /**
     * Finds the nodes that reference the definition of the node.
     */
    findReferencesAsNodes(): Node[];
}

export declare type ReferenceFindableNodeExtensionType = Node<ts.Node & {
    name?: ts.PropertyName | ts.BindingName;
}>;

export declare function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T;

export interface ParameteredNode {
    /**
     * Gets a parameter or undefined if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getParameter(name: string): ParameterDeclaration | undefined;
    /**
     * Gets a parameter or undefined if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getParameter(findFunction: (declaration: ParameterDeclaration) => boolean): ParameterDeclaration | undefined;
    /**
     * Gets a parameter or throws if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getParameterOrThrow(name: string): ParameterDeclaration;
    /**
     * Gets a parameter or throws if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getParameterOrThrow(findFunction: (declaration: ParameterDeclaration) => boolean): ParameterDeclaration;
    /**
     * Gets all the parameters of the node.
     */
    getParameters(): ParameterDeclaration[];
    /**
     * Adds a parameter.
     * @param structure - Structure of the parameter.
     */
    addParameter(structure: ParameterDeclarationStructure): ParameterDeclaration;
    /**
     * Adds parameters.
     * @param structures - Structures of the parameters.
     */
    addParameters(structures: ParameterDeclarationStructure[]): ParameterDeclaration[];
    /**
     * Inserts parameters.
     * @param index - Index to insert at.
     * @param structures - Parameters to insert.
     */
    insertParameters(index: number, structures: ParameterDeclarationStructure[]): ParameterDeclaration[];
    /**
     * Inserts a parameter.
     * @param index - Index to insert at.
     * @param structures - Parameter to insert.
     */
    insertParameter(index: number, structure: ParameterDeclarationStructure): ParameterDeclaration;
}

export declare type ParameteredNodeExtensionType = Node<ts.Node & {
    parameters: ts.NodeArray<ts.ParameterDeclaration>;
}>;

export declare function QuestionTokenableNode<T extends Constructor<QuestionTokenableNodeExtensionType>>(Base: T): Constructor<QuestionTokenableNode> & T;

export interface QuestionTokenableNode {
    /**
     * If it has a question token.
     */
    hasQuestionToken(): boolean;
    /**
     * Gets the question token node or returns undefined if it doesn't exist.
     */
    getQuestionTokenNode(): Node<ts.QuestionToken> | undefined;
    /**
     * Gets the question token node or throws.
     */
    getQuestionTokenNodeOrThrow(): Node<ts.QuestionToken>;
    /**
     * Sets if this node has a question token.
     * @param value - If it should have a question token or not.
     */
    setHasQuestionToken(value: boolean): this;
}

export declare type QuestionTokenableNodeExtensionType = Node<ts.Node & {
    questionToken?: ts.QuestionToken;
}>;

export declare function ReadonlyableNode<T extends Constructor<ReadonlyableNodeExtensionType>>(Base: T): Constructor<ReadonlyableNode> & T;

export interface ReadonlyableNode {
    /**
     * Gets if it's readonly.
     */
    isReadonly(): boolean;
    /**
     * Gets the readonly keyword, or undefined if none exists.
     */
    getReadonlyKeyword(): Node | undefined;
    /**
     * Gets the readonly keyword, or throws if none exists.
     */
    getReadonlyKeywordOrThrow(): Node;
    /**
     * Sets if this node is readonly.
     * @param value - If readonly or not.
     */
    setIsReadonly(value: boolean): this;
}

export declare type ReadonlyableNodeExtensionType = Node & ModifierableNode;

export declare function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionReturnType>>(Base: T): Constructor<ReturnTypedNode> & T;

export interface ReturnTypedNode {
    /**
     * Gets the return type.
     */
    getReturnType(): Type;
    /**
     * Gets the return type node or undefined if none exists.
     */
    getReturnTypeNode(): TypeNode | undefined;
    /**
     * Gets the return type node or throws if none exists.
     */
    getReturnTypeNodeOrThrow(): TypeNode;
    /**
     * Sets the return type of the node.
     * @param writerFunction - Writer function to set the return type with.
     */
    setReturnType(writerFunction: WriterFunction): this;
    /**
     * Sets the return type of the node.
     * @param text - Text to set as the type.
     */
    setReturnType(text: string): this;
    /**
     * Removes the return type.
     */
    removeReturnType(): this;
}

export declare type ReturnTypedNodeExtensionReturnType = Node<ts.SignatureDeclaration>;

export declare function ScopeableNode<T extends Constructor<ScopeableNodeExtensionType>>(Base: T): Constructor<ScopeableNode> & T;

export interface ScopeableNode {
    /**
     * Gets the scope.
     */
    getScope(): Scope | undefined;
    /**
     * Sets the scope.
     * @param scope - Scope to set to.
     */
    setScope(scope: Scope | undefined): this;
    /**
     * Gets if the node has a scope keyword.
     */
    hasScopeKeyword(): boolean;
}

export declare type ScopeableNodeExtensionType = Node & ModifierableNode;

export declare function ScopedNode<T extends Constructor<ScopedNodeExtensionType>>(Base: T): Constructor<ScopedNode> & T;

export interface ScopedNode {
    /**
     * Gets the scope.
     */
    getScope(): Scope;
    /**
     * Sets the scope.
     * @param scope - Scope to set to.
     */
    setScope(scope: Scope | undefined): this;
    /**
     * Gets if the node has a scope keyword.
     */
    hasScopeKeyword(): boolean;
}

export declare type ScopedNodeExtensionType = Node & ModifierableNode;

export declare function SignaturedDeclaration<T extends Constructor<SignaturedDeclarationExtensionType>>(Base: T): Constructor<SignaturedDeclaration> & T;

export interface SignaturedDeclaration extends ParameteredNode, ReturnTypedNode {
}

export declare type SignaturedDeclarationExtensionType = Node<ts.SignatureDeclaration>;

export declare function StaticableNode<T extends Constructor<StaticableNodeExtensionType>>(Base: T): Constructor<StaticableNode> & T;

export interface StaticableNode {
    /**
     * Gets if it's static.
     */
    isStatic(): boolean;
    /**
     * Gets the static keyword, or undefined if none exists.
     */
    getStaticKeyword(): Node | undefined;
    /**
     * Gets the static keyword, or throws if none exists.
     */
    getStaticKeywordOrThrow(): Node;
    /**
     * Sets if the node is static.
     * @param value - If it should be static or not.
     */
    setIsStatic(value: boolean): this;
}

export declare type StaticableNodeExtensionType = Node & ModifierableNode;

export declare function TextInsertableNode<T extends Constructor<TextInsertableNodeExtensionType>>(Base: T): Constructor<TextInsertableNode> & T;

export interface TextInsertableNode {
    /**
     * Inserts text within the body of the node.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param pos - Position to insert at.
     * @param text - Text to insert.
     */
    insertText(pos: number, text: string): this;
    /**
     * Inserts text within the body of the node using a writer.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param pos - Position to insert at.
     * @param writerFunction - Write the text using the provided writer.
     */
    insertText(pos: number, writerFunction: WriterFunction): this;
    /**
     * Replaces text within the body of the node.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param range - Start and end position of the text to replace.
     * @param text - Text to replace the range with.
     */
    replaceText(range: [number, number], text: string): this;
    /**
     * Replaces text within the body of the node using a writer function.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param range - Start and end position of the text to replace.
     * @param writerFunction - Write the text using the provided writer.
     */
    replaceText(range: [number, number], writerFunction: WriterFunction): this;
    /**
     * Removes all the text within the node
     */
    removeText(): this;
    /**
     * Removes text within the body of the node.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param pos - Start position to remove.
     * @param end - End position to remove.
     */
    removeText(pos: number, end: number): this;
}

export declare type TextInsertableNodeExtensionType = Node;

export declare function TypeArgumentedNode<T extends Constructor<TypeArgumentedNodeExtensionType>>(Base: T): Constructor<TypeArgumentedNode> & T;

export interface TypeArgumentedNode {
    /**
     * Gets all the type arguments of the node.
     */
    getTypeArguments(): TypeNode[];
    /**
     * Adds a type argument.
     * @param argumentText - Argument text to add.
     */
    addTypeArgument(argumentText: string): TypeNode;
    /**
     * Adds type arguments.
     * @param argumentTexts - Argument texts to add.
     */
    addTypeArguments(argumentTexts: string[]): TypeNode[];
    /**
     * Inserts a type argument.
     * @param index - Index to insert at.
     * @param argumentText - Argument text to insert.
     */
    insertTypeArgument(index: number, argumentText: string): TypeNode;
    /**
     * Inserts type arguments.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument texts to insert.
     */
    insertTypeArguments(index: number, argumentTexts: string[]): TypeNode[];
    /**
     * Removes a type argument.
     * @param typeArg - Type argument to remove.
     */
    removeTypeArgument(typeArg: Node): this;
    /**
     * Removes a type argument.
     * @param index - Index to remove.
     */
    removeTypeArgument(index: number): this;
}

export declare type TypeArgumentedNodeExtensionType = Node<ts.Node & {
    typeArguments?: ts.NodeArray<ts.TypeNode>;
}>;

export declare function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T;

export interface TypedNode {
    /**
     * Gets the type node or undefined if none exists.
     */
    getTypeNode(): TypeNode | undefined;
    /**
     * Gets the type node or throws if none exists.
     */
    getTypeNodeOrThrow(): TypeNode;
    /**
     * Sets the type.
     * @param writerFunction - Writer function to set the type with.
     */
    setType(writerFunction: WriterFunction): this;
    /**
     * Sets the type.
     * @param text - Text to set the type to.
     */
    setType(text: string): this;
    /**
     * Removes the type.
     */
    removeType(): this;
}

export declare type TypedNodeExtensionType = Node<ts.Node & {
    type?: ts.TypeNode;
}>;

export declare function TypeElementMemberedNode<T extends Constructor<TypeElementMemberedNodeExtensionType>>(Base: T): Constructor<TypeElementMemberedNode> & T;

export interface TypeElementMemberedNode {
    /**
     * Add construct signature.
     * @param structure - Structure representing the construct signature.
     */
    addConstructSignature(structure: ConstructSignatureDeclarationStructure): ConstructSignatureDeclaration;
    /**
     * Add construct signatures.
     * @param structures - Structures representing the construct signatures.
     */
    addConstructSignatures(structures: ConstructSignatureDeclarationStructure[]): ConstructSignatureDeclaration[];
    /**
     * Insert construct signature.
     * @param index - Index to insert at.
     * @param structure - Structure representing the construct signature.
     */
    insertConstructSignature(index: number, structure: ConstructSignatureDeclarationStructure): ConstructSignatureDeclaration;
    /**
     * Insert construct signatures.
     * @param index - Index to insert at.
     * @param structures - Structures representing the construct signatures.
     */
    insertConstructSignatures(index: number, structures: ConstructSignatureDeclarationStructure[]): ConstructSignatureDeclaration[];
    /**
     * Gets the first construct signature by a find function.
     * @param findFunction - Function to find the construct signature by.
     */
    getConstructSignature(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration | undefined;
    /**
     * Gets the first construct signature by a find function or throws if not found.
     * @param findFunction - Function to find the construct signature by.
     */
    getConstructSignatureOrThrow(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration;
    /**
     * Gets the interface construct signatures.
     */
    getConstructSignatures(): ConstructSignatureDeclaration[];
    /**
     * Add call signature.
     * @param structure - Structure representing the call signature.
     */
    addCallSignature(structure: CallSignatureDeclarationStructure): CallSignatureDeclaration;
    /**
     * Add call signatures.
     * @param structures - Structures representing the call signatures.
     */
    addCallSignatures(structures: CallSignatureDeclarationStructure[]): CallSignatureDeclaration[];
    /**
     * Insert call signature.
     * @param index - Index to insert at.
     * @param structure - Structure representing the call signature.
     */
    insertCallSignature(index: number, structure: CallSignatureDeclarationStructure): CallSignatureDeclaration;
    /**
     * Insert call signatures.
     * @param index - Index to insert at.
     * @param structures - Structures representing the call signatures.
     */
    insertCallSignatures(index: number, structures: CallSignatureDeclarationStructure[]): CallSignatureDeclaration[];
    /**
     * Gets the first call signature by a find function.
     * @param findFunction - Function to find the call signature by.
     */
    getCallSignature(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration | undefined;
    /**
     * Gets the first call signature by a find function or throws if not found.
     * @param findFunction - Function to find the call signature by.
     */
    getCallSignatureOrThrow(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration;
    /**
     * Gets the interface call signatures.
     */
    getCallSignatures(): CallSignatureDeclaration[];
    /**
     * Add index signature.
     * @param structure - Structure representing the index signature.
     */
    addIndexSignature(structure: IndexSignatureDeclarationStructure): IndexSignatureDeclaration;
    /**
     * Add index signatures.
     * @param structures - Structures representing the index signatures.
     */
    addIndexSignatures(structures: IndexSignatureDeclarationStructure[]): IndexSignatureDeclaration[];
    /**
     * Insert index signature.
     * @param index - Index to insert at.
     * @param structure - Structure representing the index signature.
     */
    insertIndexSignature(index: number, structure: IndexSignatureDeclarationStructure): IndexSignatureDeclaration;
    /**
     * Insert index signatures.
     * @param index - Index to insert at.
     * @param structures - Structures representing the index signatures.
     */
    insertIndexSignatures(index: number, structures: IndexSignatureDeclarationStructure[]): IndexSignatureDeclaration[];
    /**
     * Gets the first index signature by a find function.
     * @param findFunction - Function to find the index signature by.
     */
    getIndexSignature(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration | undefined;
    /**
     * Gets the first index signature by a find function or throws if not found.
     * @param findFunction - Function to find the index signature by.
     */
    getIndexSignatureOrThrow(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration;
    /**
     * Gets the interface index signatures.
     */
    getIndexSignatures(): IndexSignatureDeclaration[];
    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure: MethodSignatureStructure): MethodSignature;
    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures: MethodSignatureStructure[]): MethodSignature[];
    /**
     * Insert method.
     * @param index - Index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index: number, structure: MethodSignatureStructure): MethodSignature;
    /**
     * Insert methods.
     * @param index - Index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index: number, structures: MethodSignatureStructure[]): MethodSignature[];
    /**
     * Gets the first method by name.
     * @param name - Name.
     */
    getMethod(name: string): MethodSignature | undefined;
    /**
     * Gets the first method by a find function.
     * @param findFunction - Function to find the method by.
     */
    getMethod(findFunction: (member: MethodSignature) => boolean): MethodSignature | undefined;
    /**
     * Gets the first method by name or throws if not found.
     * @param name - Name.
     */
    getMethodOrThrow(name: string): MethodSignature;
    /**
     * Gets the first method by a find function or throws if not found.
     * @param findFunction - Function to find the method by.
     */
    getMethodOrThrow(findFunction: (member: MethodSignature) => boolean): MethodSignature;
    /**
     * Gets the interface method signatures.
     */
    getMethods(): MethodSignature[];
    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure: PropertySignatureStructure): PropertySignature;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures: PropertySignatureStructure[]): PropertySignature[];
    /**
     * Insert property.
     * @param index - Index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index: number, structure: PropertySignatureStructure): PropertySignature;
    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index: number, structures: PropertySignatureStructure[]): PropertySignature[];
    /**
     * Gets the first property by name.
     * @param name - Name.
     */
    getProperty(name: string): PropertySignature | undefined;
    /**
     * Gets the first property by a find function.
     * @param findFunction - Function to find the property by.
     */
    getProperty(findFunction: (member: PropertySignature) => boolean): PropertySignature | undefined;
    /**
     * Gets the first property by name or throws if not found.
     * @param name - Name.
     */
    getPropertyOrThrow(name: string): PropertySignature;
    /**
     * Gets the first property by a find function or throws if not found.
     * @param findFunction - Function to find the property by.
     */
    getPropertyOrThrow(findFunction: (member: PropertySignature) => boolean): PropertySignature;
    /**
     * Gets the interface property signatures.
     */
    getProperties(): PropertySignature[];
    /**
     * Gets all the members.
     */
    getMembers(): TypeElementTypes[];
}

export declare type TypeElementMemberedNodeExtensionType = Node<ts.Node & {
    members: ts.TypeElement[];
}>;

export declare function TypeParameteredNode<T extends Constructor<TypeParameteredNodeExtensionType>>(Base: T): Constructor<TypeParameteredNode> & T;

export interface TypeParameteredNode {
    /**
     * Gets a type parameter or undefined if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getTypeParameter(name: string): TypeParameterDeclaration | undefined;
    /**
     * Gets a type parameter or undefined if it doesn't exist.
     * @param findFunction - Function to use to find the type parameter.
     */
    getTypeParameter(findFunction: (declaration: TypeParameterDeclaration) => boolean): TypeParameterDeclaration | undefined;
    /**
     * Gets a type parameter or throws if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getTypeParameterOrThrow(name: string): TypeParameterDeclaration;
    /**
     * Gets a type parameter or throws if it doesn't exist.
     * @param findFunction - Function to use to find the type parameter.
     */
    getTypeParameterOrThrow(findFunction: (declaration: TypeParameterDeclaration) => boolean): TypeParameterDeclaration;
    /**
     * Gets the type parameters.
     */
    getTypeParameters(): TypeParameterDeclaration[];
    /**
     * Adds a type parameter.
     * @param structure - Structure of the type parameter.
     */
    addTypeParameter(structure: TypeParameterDeclarationStructure): TypeParameterDeclaration;
    /**
     * Adds type parameters.
     * @param structures - Structures of the type parameters.
     */
    addTypeParameters(structures: TypeParameterDeclarationStructure[]): TypeParameterDeclaration[];
    /**
     * Inserts a type parameter.
     * @param index - Index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the type parameter.
     */
    insertTypeParameter(index: number, structure: TypeParameterDeclarationStructure): TypeParameterDeclaration;
    /**
     * Inserts type parameters.
     * @param index - Index to insert at. Specify a negative index to insert from the reverse.
     * @param structures - Structures of the type parameters.
     */
    insertTypeParameters(index: number, structures: TypeParameterDeclarationStructure[]): TypeParameterDeclaration[];
}

export declare type TypeParameteredNodeExtensionType = Node<ts.Node & {
    typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>;
}>;

export declare function UnwrappableNode<T extends Constructor<UnwrappableNodeExtensionType>>(Base: T): Constructor<UnwrappableNode> & T;

export interface UnwrappableNode {
    /**
     * Replaces the node's text with its body's statements.
     */
    unwrap(): void;
}

export declare type UnwrappableNodeExtensionType = Node;

export declare function AbstractableNode<T extends Constructor<AbstractableNodeExtensionType>>(Base: T): Constructor<AbstractableNode> & T;

export interface AbstractableNode {
    /**
     * Gets if the node is abstract.
     */
    isAbstract(): boolean;
    /**
     * Gets the abstract keyword or undefined if it doesn't exist.
     */
    getAbstractKeyword(): Node | undefined;
    /**
     * Gets the abstract keyword or throws if it doesn't exist.
     */
    getAbstractKeywordOrThrow(): Node;
    /**
     * Sets if the node is abstract.
     * @param isAbstract - If it should be abstract or not.
     */
    setIsAbstract(isAbstract: boolean): this;
}

export declare type AbstractableNodeExtensionType = Node & ModifierableNode;

export declare type ClassPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;

export declare type ClassInstancePropertyTypes = ClassPropertyTypes | ParameterDeclaration;

export declare type ClassInstanceMemberTypes = MethodDeclaration | ClassInstancePropertyTypes;

export declare type ClassStaticPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;

export declare type ClassStaticMemberTypes = MethodDeclaration | ClassStaticPropertyTypes;

export declare type ClassMemberTypes = MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration;

declare const ClassDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<ImplementsClauseableNode> & Constructor<HeritageClauseableNode> & Constructor<DecoratableNode> & Constructor<TypeParameteredNode> & Constructor<NamespaceChildableNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<AbstractableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NameableNode> & typeof Statement;

export declare class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ClassDeclarationStructure>): this;
    /**
     * Sets the extends expression.
     * @param text - Text to set as the extends expression.
     */
    setExtends(text: string): this;
    /**
     * Removes the extends expression, if it exists.
     */
    removeExtends(): this;
    /**
     * Gets the extends expression or throws if it doesn't exist.
     */
    getExtendsOrThrow(): ExpressionWithTypeArguments;
    /**
     * Gets the extends expression or returns undefined if it doesn't exist.
     */
    getExtends(): ExpressionWithTypeArguments | undefined;
    /**
     * Adds a constructor.
     * @param structure - Structure of the constructor.
     */
    addConstructor(structure?: ConstructorDeclarationStructure): ConstructorDeclaration;
    /**
     * Adds constructors.
     * @param structures - Structures of the constructor.
     */
    addConstructors(structures: ConstructorDeclarationStructure[]): ConstructorDeclaration[];
    /**
     * Inserts a constructor.
     * @param index - Index to insert at.
     * @param structure - Structure of the constructor.
     */
    insertConstructor(index: number, structure?: ConstructorDeclarationStructure): ConstructorDeclaration;
    /**
     * Inserts constructors.
     * @param index - Index to insert at.
     * @param structures - Structures of the constructor.
     */
    insertConstructors(index: number, structures: ConstructorDeclarationStructure[]): ConstructorDeclaration[];
    /**
     * Gets the constructor declarations.
     */
    getConstructors(): ConstructorDeclaration[];
    /**
     * Add get accessor.
     * @param structure - Structure representing the get accessor.
     */
    addGetAccessor(structure: GetAccessorDeclarationStructure): GetAccessorDeclaration;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addGetAccessors(structures: GetAccessorDeclarationStructure[]): GetAccessorDeclaration[];
    /**
     * Insert get accessor.
     * @param index - Index to insert at.
     * @param structure - Structure representing the get accessor.
     */
    insertGetAccessor(index: number, structure: GetAccessorDeclarationStructure): GetAccessorDeclaration;
    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertGetAccessors(index: number, structures: GetAccessorDeclarationStructure[]): GetAccessorDeclaration[];
    /**
     * Add set accessor.
     * @param structure - Structure representing the set accessor.
     */
    addSetAccessor(structure: SetAccessorDeclarationStructure): SetAccessorDeclaration;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addSetAccessors(structures: SetAccessorDeclarationStructure[]): SetAccessorDeclaration[];
    /**
     * Insert set accessor.
     * @param index - Index to insert at.
     * @param structure - Structure representing the set accessor.
     */
    insertSetAccessor(index: number, structure: SetAccessorDeclarationStructure): SetAccessorDeclaration;
    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertSetAccessors(index: number, structures: SetAccessorDeclarationStructure[]): SetAccessorDeclaration[];
    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure: PropertyDeclarationStructure): PropertyDeclaration;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures: PropertyDeclarationStructure[]): PropertyDeclaration[];
    /**
     * Insert property.
     * @param index - Index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index: number, structure: PropertyDeclarationStructure): PropertyDeclaration;
    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index: number, structures: PropertyDeclarationStructure[]): PropertyDeclaration[];
    /**
     * Gets the first instance property by name.
     * @param name - Name.
     */
    getInstanceProperty(name: string): ClassInstancePropertyTypes | undefined;
    /**
     * Gets the first instance property by a find function.
     * @param findFunction - Function to find an instance property by.
     */
    getInstanceProperty(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes | undefined;
    /**
     * Gets the first instance property by name or throws if not found.
     * @param name - Name.
     */
    getInstancePropertyOrThrow(name: string): ClassInstancePropertyTypes;
    /**
     * Gets the first instance property by a find function or throws if not found.
     * @param findFunction - Function to find an instance property by.
     */
    getInstancePropertyOrThrow(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes;
    /**
     * Gets the class instance property declarations.
     */
    getInstanceProperties(): ClassInstancePropertyTypes[];
    /**
     * Gets the first static property by name.
     * @param name - Name.
     */
    getStaticProperty(name: string): ClassStaticPropertyTypes | undefined;
    /**
     * Gets the first static property by a find function.
     * @param findFunction - Function to find a static property by.
     */
    getStaticProperty(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes | undefined;
    /**
     * Gets the first static property by name or throws if not found.
     * @param name - Name.
     */
    getStaticPropertyOrThrow(name: string): ClassStaticPropertyTypes;
    /**
     * Gets the first static property by a find function. or throws if not found.
     * @param findFunction - Function to find a static property by.
     */
    getStaticPropertyOrThrow(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes;
    /**
     * Gets the class instance property declarations.
     */
    getStaticProperties(): ClassStaticPropertyTypes[];
    /**
     * Gets the first property declaration by name.
     * @param name - Name.
     */
    getProperty(name: string): PropertyDeclaration | undefined;
    /**
     * Gets the first property declaration by a find function.
     * @param findFunction - Function to find a property declaration by.
     */
    getProperty(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration | undefined;
    /**
     * Gets the first property declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getPropertyOrThrow(name: string): PropertyDeclaration;
    /**
     * Gets the first property declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a property declaration by.
     */
    getPropertyOrThrow(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration;
    /**
     * Gets the class property declarations regardless of whether it's an instance of static property.
     */
    getProperties(): PropertyDeclaration[];
    /**
     * Gets the first get accessor declaration by name.
     * @param name - Name.
     */
    getGetAccessor(name: string): GetAccessorDeclaration | undefined;
    /**
     * Gets the first get accessor declaration by a find function.
     * @param findFunction - Function to find a get accessor declaration by.
     */
    getGetAccessor(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration | undefined;
    /**
     * Gets the first get accessor declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getGetAccessorOrThrow(name: string): GetAccessorDeclaration;
    /**
     * Gets the first get accessor declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a get accessor declaration by.
     */
    getGetAccessorOrThrow(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration;
    /**
     * Gets the class get accessor declarations regardless of whether it's an instance of static getAccessor.
     */
    getGetAccessors(): GetAccessorDeclaration[];
    /**
     * Sets the first set accessor declaration by name.
     * @param name - Name.
     */
    getSetAccessor(name: string): SetAccessorDeclaration | undefined;
    /**
     * Sets the first set accessor declaration by a find function.
     * @param findFunction - Function to find a set accessor declaration by.
     */
    getSetAccessor(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration | undefined;
    /**
     * Sets the first set accessor declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getSetAccessorOrThrow(name: string): SetAccessorDeclaration;
    /**
     * Sets the first set accessor declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a set accessor declaration by.
     */
    getSetAccessorOrThrow(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration;
    /**
     * Sets the class set accessor declarations regardless of whether it's an instance of static setAccessor.
     */
    getSetAccessors(): SetAccessorDeclaration[];
    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure: MethodDeclarationStructure): MethodDeclaration;
    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures: MethodDeclarationStructure[]): MethodDeclaration[];
    /**
     * Insert method.
     * @param index - Index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index: number, structure: MethodDeclarationStructure): MethodDeclaration;
    /**
     * Insert methods.
     * @param index - Index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index: number, structures: MethodDeclarationStructure[]): MethodDeclaration[];
    /**
     * Gets the first method declaration by name.
     * @param name - Name.
     */
    getMethod(name: string): MethodDeclaration | undefined;
    /**
     * Gets the first method declaration by a find function.
     * @param findFunction - Function to find a method declaration by.
     */
    getMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
    /**
     * Gets the first method declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getMethodOrThrow(name: string): MethodDeclaration;
    /**
     * Gets the first method declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a method declaration by.
     */
    getMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
    /**
     * Gets the class method declarations regardless of whether it's an instance of static method.
     */
    getMethods(): MethodDeclaration[];
    /**
     * Gets the first instance method by name.
     * @param name - Name.
     */
    getInstanceMethod(name: string): MethodDeclaration | undefined;
    /**
     * Gets the first instance method by a find function.
     * @param findFunction - Function to find an instance method by.
     */
    getInstanceMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
    /**
     * Gets the first instance method by name or throws if not found.
     * @param name - Name.
     */
    getInstanceMethodOrThrow(name: string): MethodDeclaration;
    /**
     * Gets the first instance method by a find function. or throws if not found.
     * @param findFunction - Function to find an instance method by.
     */
    getInstanceMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
    /**
     * Gets the class instance method declarations.
     */
    getInstanceMethods(): MethodDeclaration[];
    /**
     * Gets the first static method by name.
     * @param name - Name.
     */
    getStaticMethod(name: string): MethodDeclaration | undefined;
    /**
     * Gets the first static method by a find function.
     * @param findFunction - Function to find a static method by.
     */
    getStaticMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
    /**
     * Gets the first static method by name or throws if not found.
     * @param name - Name.
     */
    getStaticMethodOrThrow(name: string): MethodDeclaration;
    /**
     * Gets the first static method by a find function. or throws if not found.
     * @param findFunction - Function to find a static method by.
     */
    getStaticMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
    /**
     * Gets the class instance method declarations.
     */
    getStaticMethods(): MethodDeclaration[];
    /**
     * Gets the first instance member by name.
     * @param name - Name.
     */
    getInstanceMember(name: string): ClassInstanceMemberTypes | undefined;
    /**
     * Gets the first instance member by a find function.
     * @param findFunction - Function to find the instance member by.
     */
    getInstanceMember(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes | undefined;
    /**
     * Gets the first instance member by name or throws if not found.
     * @param name - Name.
     */
    getInstanceMemberOrThrow(name: string): ClassInstanceMemberTypes;
    /**
     * Gets the first instance member by a find function. or throws if not found.
     * @param findFunction - Function to find the instance member by.
     */
    getInstanceMemberOrThrow(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes;
    /**
     * Gets the instance members.
     */
    getInstanceMembers(): ClassInstanceMemberTypes[];
    /**
     * Gets the first static member by name.
     * @param name - Name.
     */
    getStaticMember(name: string): ClassStaticMemberTypes | undefined;
    /**
     * Gets the first static member by a find function.
     * @param findFunction - Function to find an static method by.
     */
    getStaticMember(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes | undefined;
    /**
     * Gets the first static member by name or throws if not found.
     * @param name - Name.
     */
    getStaticMemberOrThrow(name: string): ClassStaticMemberTypes;
    /**
     * Gets the first static member by a find function. or throws if not found.
     * @param findFunction - Function to find an static method by.
     */
    getStaticMemberOrThrow(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes;
    /**
     * Gets the static members.
     */
    getStaticMembers(): (GetAccessorDeclaration | MethodDeclaration | PropertyDeclaration | SetAccessorDeclaration)[];
    /**
     * Gets the class' members regardless of whether it's an instance of static member.
     */
    getMembers(): ClassMemberTypes[];
    /**
     * Gets the first member by name.
     * @param name - Name.
     */
    getMember(name: string): ClassMemberTypes | undefined;
    /**
     * Gets the first member by a find function.
     * @param findFunction - Function to find an method by.
     */
    getMember(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes | undefined;
    /**
     * Gets the first member by name or throws if not found.
     * @param name - Name.
     */
    getMemberOrThrow(name: string): ClassMemberTypes;
    /**
     * Gets the first member by a find function. or throws if not found.
     * @param findFunction - Function to find an method by.
     */
    getMemberOrThrow(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes;
    /**
     * Gets the base types.
     *
     * This is useful to use if the base could possibly be a mixin.
     */
    getBaseTypes(): Type[];
    /**
     * Gets the base class or throws.
     *
     * Note: Use getBaseTypes if you need to get the mixins.
     */
    getBaseClassOrThrow(): ClassDeclaration;
    /**
     * Gets the base class.
     *
     * Note: Use getBaseTypes if you need to get the mixins.
     */
    getBaseClass(): ClassDeclaration | undefined;
    /**
     * Gets all the derived classes.
     */
    getDerivedClasses(): ClassDeclaration[];
    private getImmediateDerivedClasses;
}

declare const ConstructorDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<OverloadableNode> & Constructor<ScopedNode> & Constructor<FunctionLikeDeclaration> & Constructor<BodyableNode> & typeof Node;

export declare class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ConstructorDeclarationStructure>): this;
    /**
     * Add a constructor overload.
     * @param structure - Structure to add.
     */
    addOverload(structure: ConstructorDeclarationOverloadStructure): ConstructorDeclaration;
    /**
     * Add constructor overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures: ConstructorDeclarationOverloadStructure[]): ConstructorDeclaration[];
    /**
     * Inserts a constructor overload.
     * @param index - Index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index: number, structure: ConstructorDeclarationOverloadStructure): ConstructorDeclaration;
    /**
     * Inserts constructor overloads.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index: number, structures: ConstructorDeclarationOverloadStructure[]): ConstructorDeclaration[];
    /**
     * Remove the constructor.
     */
    remove(): void;
}

declare const GetAccessorDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<StaticableNode> & Constructor<BodiedNode> & Constructor<FunctionLikeDeclaration> & Constructor<PropertyNamedNode> & typeof Node;

export declare class GetAccessorDeclaration extends GetAccessorDeclarationBase<ts.GetAccessorDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<GetAccessorDeclarationStructure>): this;
    /**
     * Gets the corresponding set accessor if one exists.
     */
    getSetAccessor(): SetAccessorDeclaration | undefined;
    /**
     * Gets the corresponding set accessor or throws if not exists.
     */
    getSetAccessorOrThrow(): SetAccessorDeclaration;
    /**
     * Removes the get accessor.
     */
    remove(): void;
}

declare const MethodDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<OverloadableNode> & Constructor<BodyableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<StaticableNode> & Constructor<AsyncableNode> & Constructor<GeneratorableNode> & Constructor<FunctionLikeDeclaration> & Constructor<PropertyNamedNode> & typeof Node;

export declare class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<MethodDeclarationStructure>): this;
    /**
     * Add a method overload.
     * @param structure - Structure to add.
     */
    addOverload(structure: MethodDeclarationOverloadStructure): MethodDeclaration;
    /**
     * Add method overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures: MethodDeclarationOverloadStructure[]): MethodDeclaration[];
    /**
     * Inserts a method overload.
     * @param index - Index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index: number, structure: MethodDeclarationOverloadStructure): MethodDeclaration;
    /**
     * Inserts method overloads.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index: number, structures: MethodDeclarationOverloadStructure[]): MethodDeclaration[];
    /**
     * Removes the method.
     */
    remove(): void;
}

declare const PropertyDeclarationBase: Constructor<ChildOrderableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<StaticableNode> & Constructor<JSDocableNode> & Constructor<ReadonlyableNode> & Constructor<ExclamationTokenableNode> & Constructor<QuestionTokenableNode> & Constructor<InitializerExpressionableNode> & Constructor<TypedNode> & Constructor<PropertyNamedNode> & Constructor<ModifierableNode> & typeof Node;

export declare class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertyDeclarationStructure>): this;
    /**
     * Removes the property.
     */
    remove(): void;
}

declare const SetAccessorDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<StaticableNode> & Constructor<BodiedNode> & Constructor<FunctionLikeDeclaration> & Constructor<PropertyNamedNode> & typeof Node;

export declare class SetAccessorDeclaration extends SetAccessorDeclarationBase<ts.SetAccessorDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<SetAccessorDeclarationStructure>): this;
    /**
     * Gets the corresponding get accessor if one exists.
     */
    getGetAccessor(): GetAccessorDeclaration | undefined;
    /**
     * Gets the corresponding get accessor or throws if not exists.
     */
    getGetAccessorOrThrow(): GetAccessorDeclaration;
    /**
     * Removes the set accessor.
     */
    remove(): void;
}

export declare class CommentRange {
    /**
     * Gets the underlying compiler object.
     */
    readonly compilerObject: ts.CommentRange;
    /**
     * Gets the source file of the comment range.
     */
    getSourceFile(): SourceFile;
    /**
     * Gets the comment syntax kind.
     */
    getKind(): ts.CommentKind;
    /**
     * Gets the position.
     */
    getPos(): number;
    /**
     * Gets the end.
     */
    getEnd(): number;
    /**
     * Gets the width of the comment range.
     */
    getWidth(): number;
    /**
     * Gets the text of the comment range.
     */
    getText(): string;
    /**
     * Gets if the comment range was forgotten.
     *
     * This will be true after any manipulations have occured to the source file this comment range was generated from.
     */
    wasForgotten(): boolean;
    private _throwIfForgotten;
}

export declare class ComputedPropertyName extends Node<ts.ComputedPropertyName> {
    /**
     * Gets the expression.
     */
    getExpression(): Expression;
}

declare const IdentifierBase: Constructor<ReferenceFindableNode> & typeof PrimaryExpression;

export declare class Identifier extends IdentifierBase<ts.Identifier> {
    /**
     * Gets the text for the identifier.
     */
    getText(): string;
    /**
     * Renames the identifier.
     * @param newName - New name of the identifier.
     */
    rename(newName: string): void;
    /**
     * Gets the definition nodes of the identifier.
     * @remarks This is similar to "go to definition" and `.getDefinitions()`, but only returns the nodes.
     */
    getDefinitionNodes(): Node[];
    /**
     * Gets the definitions of the identifier.
     * @remarks This is similar to "go to definition." Use `.getDefinitionNodes()` if you only care about the nodes.
     */
    getDefinitions(): DefinitionInfo[];
    /**
     * Gets the implementations of the identifier.
     *
     * This is similar to "go to implementation."
     */
    getImplementations(): ImplementationLocation[];
}

export declare type NodePropertyToWrappedType<NodeType extends ts.Node, KeyName extends keyof NodeType, NonNullableNodeType = NonNullable<NodeType[KeyName]>> = NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeTypeForNullable> | undefined ? CompilerNodeToWrappedType<ArrayNodeTypeForNullable>[] | undefined : NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeType> ? CompilerNodeToWrappedType<ArrayNodeType>[] : NodeType[KeyName] extends ts.Node ? CompilerNodeToWrappedType<NodeType[KeyName]> : NonNullableNodeType extends ts.Node ? CompilerNodeToWrappedType<NonNullableNodeType> | undefined : NodeType[KeyName];

export declare class Node<NodeType extends ts.Node = ts.Node> {
    /**
     * Gets the underlying compiler node.
     */
    readonly compilerNode: NodeType;
    /**
     * Releases the node and all its descendants from the underlying node cache and ast.
     *
     * This is useful if you want to improve the performance of manipulation by not tracking this node anymore.
     */
    forget(): void;
    /**
     * Gets if the node was forgotten.
     *
     * This will be true when the node was forgotten or removed.
     */
    wasForgotten(): boolean;
    /**
     * Gets the syntax kind.
     */
    getKind(): SyntaxKind;
    /**
     * Gets the syntax kind name.
     */
    getKindName(): string;
    /**
     * Prints the node using the compiler's printer.
     * @param options - Options.
     */
    print(options?: PrintNodeOptions): string;
    /**
     * Gets the symbol or throws an error if it doesn't exist.
     */
    getSymbolOrThrow(): Symbol;
    /**
     * Gets the compiler symbol or undefined if it doesn't exist.
     */
    getSymbol(): Symbol | undefined;
    /**
     * Gets the type of the node.
     */
    getType(): Type;
    /**
     * If the node contains the provided range (inclusive).
     * @param pos - Start position.
     * @param end - End position.
     */
    containsRange(pos: number, end: number): boolean;
    /**
     * Gets if the specified position is within a string.
     * @param pos - Position.
     */
    isInStringAtPos(pos: number): boolean;
    /**
     * Gets the first child by a condition or throws.
     * @param condition - Condition.
     */
    getFirstChildOrThrow(condition?: (node: Node) => boolean): Node<ts.Node>;
    /**
     * Gets the first child by a condition.
     * @param condition - Condition.
     */
    getFirstChild(condition?: (node: Node) => boolean): Node | undefined;
    /**
     * Gets the last child by a condition or throws.
     * @param condition - Condition.
     */
    getLastChildOrThrow(condition?: (node: Node) => boolean): Node<ts.Node>;
    /**
     * Gets the last child by a condition.
     * @param condition - Condition.
     */
    getLastChild(condition?: (node: Node) => boolean): Node | undefined;
    /**
     * Gets the first descendant by a condition or throws.
     * @param condition - Condition.
     */
    getFirstDescendantOrThrow(condition?: (node: Node) => boolean): Node<ts.Node>;
    /**
     * Gets the first descendant by a condition.
     * @param condition - Condition.
     */
    getFirstDescendant(condition?: (node: Node) => boolean): Node<ts.Node> | undefined;
    /**
     * Gets the previous sibling or throws.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getPreviousSiblingOrThrow(condition?: (node: Node) => boolean): Node<ts.Node>;
    /**
     * Gets the previous sibling.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getPreviousSibling(condition?: (node: Node) => boolean): Node | undefined;
    /**
     * Gets the next sibling or throws.
     * @param condition - Optional condition for getting the next sibling.
     */
    getNextSiblingOrThrow(condition?: (node: Node) => boolean): Node<ts.Node>;
    /**
     * Gets the next sibling.
     * @param condition - Optional condition for getting the previous sibling.
     */
    getNextSibling(condition?: (node: Node) => boolean): Node | undefined;
    /**
     * Gets the previous siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getPreviousSiblings(): Node[];
    /**
     * Gets the next siblings.
     *
     * Note: Closest sibling is the zero index.
     */
    getNextSiblings(): Node[];
    /**
     * Gets all the children of the node.
     */
    getChildren(): Node[];
    /**
     * Gets the child at the specified index.
     * @param index - Index of the child.
     */
    getChildAtIndex(index: number): Node;
    /**
     * Gets the child syntax list or throws if it doesn't exist.
     */
    getChildSyntaxListOrThrow(): SyntaxList;
    /**
     * Gets the child syntax list if it exists.
     */
    getChildSyntaxList(): SyntaxList | undefined;
    /**
     * Invokes the `cbNode` callback for each child and the `cbNodeArray` for every array of nodes stored in properties of the node.
     * If `cbNodeArray` is not defined, then it will pass every element of the array to `cbNode`.
     *
     * @remarks There exists a `stop` function that exists to stop iteration.
     * @param cbNode - Callback invoked for each child.
     * @param cbNodeArray - Callback invoked for each array of nodes.
     */
    forEachChild(cbNode: (node: Node, stop: () => void) => void, cbNodeArray?: (nodes: Node[], stop: () => void) => void): void;
    /**
     * Invokes the `cbNode` callback for each descendant and the `cbNodeArray` for every array of nodes stored in properties of the node and descendant nodes.
     * If `cbNodeArray` is not defined, then it will pass every element of the array to `cbNode`.
     *
     * @remarks There exists a `stop` function that exists to stop iteration.
     * @param cbNode - Callback invoked for each descendant.
     * @param cbNodeArray - Callback invoked for each array of nodes.
     */
    forEachDescendant(cbNode: (node: Node, stop: () => void) => void, cbNodeArray?: (nodes: Node[], stop: () => void) => void): void;
    /**
     * Gets the node's descendants.
     */
    getDescendants(): Node[];
    /**
     * Gets the node's descendant statements.
     */
    getDescendantStatements(): Statement[];
    /**
     * Gets the child count.
     */
    getChildCount(): number;
    /**
     * Gets the child at the provided position, or undefined if not found.
     * @param pos - Position to search for.
     */
    getChildAtPos(pos: number): Node | undefined;
    /**
     * Gets the most specific descendant at the provided position, or undefined if not found.
     * @param pos - Position to search for.
     */
    getDescendantAtPos(pos: number): Node | undefined;
    /**
     * Gets the most specific descendant at the provided start position with the specified width, or undefined if not found.
     * @param start - Start position to search for.
     * @param width - Width of the node to search for.
     */
    getDescendantAtStartWithWidth(start: number, width: number): Node | undefined;
    /**
     * Gets the start position with leading trivia.
     */
    getPos(): number;
    /**
     * Gets the end position.
     */
    getEnd(): number;
    /**
     * Gets the start position without leading trivia.
     * @param includeJsDocComment - Whether to include the JS doc comment.
     */
    getStart(includeJsDocComment?: boolean): number;
    /**
     * Gets the end position of the last significant token.
     */
    getFullStart(): number;
    /**
     * Gets the first position from the pos that is not whitespace.
     */
    getNonWhitespaceStart(): number;
    /**
     * Gets the width of the node (length without trivia).
     */
    getWidth(): number;
    /**
     * Gets the full width of the node (length with trivia).
     */
    getFullWidth(): number;
    /**
     * Gets the leading trivia width.
     */
    getLeadingTriviaWidth(): number;
    /**
     * Gets the trailing trivia width.
     *
     * This is the width from the end of the current node to the next significant token or new line.
     */
    getTrailingTriviaWidth(): number;
    /**
     * Gets the trailing trivia end.
     *
     * This is the position of the next significant token or new line.
     */
    getTrailingTriviaEnd(): number;
    /**
     * Gets the text without leading trivia.
     */
    getText(): string;
    /**
     * Gets the full text with leading trivia.
     */
    getFullText(): string;
    /**
     * Gets the combined modifier flags.
     */
    getCombinedModifierFlags(): ts.ModifierFlags;
    /**
     * Gets the source file.
     */
    getSourceFile(): SourceFile;
    /**
     * Gets a compiler node property wrapped in a Node.
     * @param propertyName - Property name.
     */
    getNodeProperty<KeyType extends keyof LocalNodeType, LocalNodeType extends ts.Node = NodeType>(propertyName: KeyType): NodePropertyToWrappedType<LocalNodeType, KeyType>;
    /**
     * Goes up the tree getting all the parents in ascending order.
     */
    getAncestors(): Node[];
    /**
     * Get the node's parent.
     */
    getParent(): Node | undefined;
    /**
     * Gets the parent or throws an error if it doesn't exist.
     */
    getParentOrThrow(): Node<ts.Node>;
    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Throws if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhileOrThrow(condition: (node: Node) => boolean): Node<ts.Node>;
    /**
     * Goes up the parents (ancestors) of the node while a condition is true.
     * Returns undefined if the initial parent doesn't match the condition.
     * @param condition - Condition that tests the parent to see if the expression is true.
     */
    getParentWhile(condition: (node: Node) => boolean): Node<ts.Node> | undefined;
    /**
     * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
     * Throws if the initial parent is not the specified syntax kind.
     * @param kind - Syntax kind to check for.
     */
    getParentWhileKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Goes up the parents (ancestors) of the node while the parent is the specified syntax kind.
     * Returns undefined if the initial parent is not the specified syntax kind.
     * @param kind - Syntax kind to check for.
     */
    getParentWhileKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the last token of this node. Usually this is a close brace.
     */
    getLastToken(): Node;
    /**
     * Gets if this node is in a syntax list.
     */
    isInSyntaxList(): boolean;
    /**
     * Gets the parent if it's a syntax list or throws an error otherwise.
     */
    getParentSyntaxListOrThrow(): Node<ts.Node>;
    /**
     * Gets the parent if it's a syntax list.
     */
    getParentSyntaxList(): Node | undefined;
    /**
     * Gets the child index of this node relative to the parent.
     */
    getChildIndex(): number;
    /**
     * Gets the indentation level of the current node.
     */
    getIndentationLevel(): number;
    /**
     * Gets the child indentation level of the current node.
     */
    getChildIndentationLevel(): number;
    /**
     * Gets the indentation text.
     * @param offset - Optional number of levels of indentation to add or remove.
     */
    getIndentationText(offset?: number): string;
    /**
     * Gets the next indentation level text.
     * @param offset - Optional number of levels of indentation to add or remove.
     */
    getChildIndentationText(offset?: number): string;
    /**
     * Gets the position of the start of the line that this node starts on.
     * @param includeJsDocComment - Whether to include the JS doc comment or not.
     */
    getStartLinePos(includeJsDocComment?: boolean): number;
    /**
     * Gets the line number at the start of the node.
     * @param includeJsDocComment - Whether to include the JS doc comment or not.
     */
    getStartLineNumber(includeJsDocComment?: boolean): number;
    /**
     * Gets the line number of the end of the node.
     */
    getEndLineNumber(): number;
    /**
     * Gets the length from the start of the line to the start of the node.
     * @param includeJsDocComment - Whether to include the JS doc comment or not.
     */
    getStartColumn(includeJsDocComment?: boolean): number;
    /**
     * Gets the length from the start of the line to the end of the node.
     */
    getEndColumn(): number;
    /**
     * Gets if this is the first node on the current line.
     */
    isFirstNodeOnLine(): boolean;
    /**
     * Replaces the text of the current node with new text.
     *
     * This will forget the current node and return a new node that can be asserted or type guarded to the correct type.
     * @param textOrWriterFunction - Text or writer function to replace with.
     * @returns The new node.
     */
    replaceWithText(textOrWriterFunction: string | WriterFunction): Node;
    /**
     * Prepends the specified whitespace to current node.
     * @param textOrWriterFunction - Text or writer function.
     */
    prependWhitespace(textOrWriterFunction: string | WriterFunction): void;
    /**
     * Appends the specified whitespace to current node.
     * @param textOrWriterFunction - Text or writer function.
     */
    appendWhitespace(textOrWriterFunction: string | WriterFunction): void;
    /**
     * Formats the node's text using the internal TypeScript formatting API.
     * @param settings - Format code settings.
     */
    formatText(settings?: FormatCodeSettings): void;
    /**
     * Gets the leading comment ranges of the current node.
     */
    getLeadingCommentRanges(): CommentRange[];
    /**
     * Gets the trailing comment ranges of the current node.
     */
    getTrailingCommentRanges(): CommentRange[];
    /**
     * Gets the children based on a kind.
     * @param kind - Syntax kind.
     */
    getChildrenOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][];
    /**
     * Gets the first child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the first child by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the first child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the first child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the last child by syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the last child by syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the last child if it matches the specified syntax kind or throws an error if not found.
     * @param kind - Syntax kind.
     */
    getLastChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the last child if it matches the specified syntax kind.
     * @param kind - Syntax kind.
     */
    getLastChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the child at the specified index if it's the specified kind or throws an exception.
     * @param index - Index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKindOrThrow<TKind extends SyntaxKind>(index: number, kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the child at the specified index if it's the specified kind or returns undefined.
     * @param index - Index to get.
     * @param kind - Expected kind.
     */
    getChildAtIndexIfKind<TKind extends SyntaxKind>(index: number, kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the previous sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the next sibiling if it matches the specified kind, or throws.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the previous sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getPreviousSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the next sibling if it matches the specified kind.
     * @param kind - Kind to check.
     */
    getNextSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the parent if it's a certain syntax kind.
     */
    getParentIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the parent if it's a certain syntax kind of throws.
     */
    getParentIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the first ancestor by syntax kind or throws if not found.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Get the first ancestor by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstAncestorByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the descendants that match a specified syntax kind.
     * @param kind - Kind to check.
     */
    getDescendantsOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][];
    /**
     * Gets the first descendant by syntax kind or throws.
     * @param kind - Syntax kind.
     */
    getFirstDescendantByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the first descendant by syntax kind.
     * @param kind - Syntax kind.
     */
    getFirstDescendantByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
}

export declare class QualifiedName extends Node<ts.QualifiedName> {
    /**
     * Gets the left side of the qualified name.
     */
    getLeft(): EntityName;
    /**
     * Gets the right identifier of the qualified name.
     */
    getRight(): Identifier;
}
export declare enum Scope {
    Public = "public",
    Protected = "protected",
    Private = "private"
}

export declare class Signature {
    /**
     * Gets the underlying compiler signature.
     */
    readonly compilerSignature: ts.Signature;
    /**
     * Gets the type parameters.
     */
    getTypeParameters(): TypeParameter[];
    /**
     * Gets the parameters.
     */
    getParameters(): Symbol[];
    /**
     * Gets the signature return type.
     */
    getReturnType(): Type;
    /**
     * Get the documentation comments.
     */
    getDocumentationComments(): SymbolDisplayPart[];
    /**
     * Gets the JS doc tags.
     */
    getJsDocTags(): JSDocTagInfo[];
}

export declare class Symbol {
    /**
     * Gets the underlying compiler symbol.
     */
    readonly compilerSymbol: ts.Symbol;
    /**
     * Gets the symbol name.
     */
    getName(): string;
    /**
     * Gets the escaped name.
     */
    getEscapedName(): string;
    /**
     * Gets the aliased symbol.
     */
    getAliasedSymbol(): Symbol | undefined;
    /**
     * Gets if the symbol is an alias.
     */
    isAlias(): boolean;
    /**
     * Gets the symbol flags.
     */
    getFlags(): SymbolFlags;
    /**
     * Gets if the symbol has the specified flags.
     * @param flags - Flags to check if the symbol has.
     */
    hasFlags(flags: SymbolFlags): boolean;
    /**
     * Gets the value declaration of a symbol or throws if it doesn't exist.
     */
    getValueDeclarationOrThrow(): Node;
    /**
     * Gets the value declaration of the symbol or returns undefined if it doesn't exist.
     */
    getValueDeclaration(): Node | undefined;
    /**
     * Gets the symbol declarations.
     */
    getDeclarations(): Node[];
    /**
     * Get the exports of the symbol.
     * @param name - Name of the export.
     */
    getExportByName(name: string): Symbol | undefined;
    /**
     * Gets the exports from the symbol.
     */
    getExports(): Symbol[];
    /**
     * Gets the declared type of the symbol.
     */
    getDeclaredType(): Type;
    /**
     * Gets the type of the symbol at a location.
     * @param node - Location to get the type at for this symbol.
     */
    getTypeAtLocation(node: Node): Type<ts.Type>;
    /**
     * Gets the fully qualified name.
     */
    getFullyQualifiedName(): string;
}

export declare class SyntaxList extends Node<ts.SyntaxList> {
    /**
     * Adds text at the end of the current children.
     * @param text - Text to insert.
     * @returns The children that were added.
     */
    addChildText(text: string): Node[];
    /**
     * Adds text at the end of the current children.
     * @param writer - Write the text using the provided writer.
     * @returns The children that were added.
     */
    addChildText(writer: WriterFunction): Node[];
    /**
     * Inserts text at the specified child index.
     * @param index - Child index to insert at.
     * @param text - Text to insert.
     * @returns The children that were inserted.
     */
    insertChildText(index: number, text: string): Node[];
    /**
     * Inserts text at the specified child index.
     * @param index - Child index to insert at.
     * @param writer - Write the text using the provided writer.
     * @returns The children that were inserted.
     */
    insertChildText(index: number, writer: WriterFunction): Node[];
}

export declare type CompilerNodeToWrappedType<T extends ts.Node> = T extends ts.ClassDeclaration ? ClassDeclaration : T extends ts.ConstructorDeclaration ? ConstructorDeclaration : T extends ts.GetAccessorDeclaration ? GetAccessorDeclaration : T extends ts.MethodDeclaration ? MethodDeclaration : T extends ts.PropertyDeclaration ? PropertyDeclaration : T extends ts.SetAccessorDeclaration ? SetAccessorDeclaration : T extends ts.ComputedPropertyName ? ComputedPropertyName : T extends ts.Identifier ? Identifier : T extends ts.QualifiedName ? QualifiedName : T extends ts.SyntaxList ? SyntaxList : T extends ts.Decorator ? Decorator : T extends ts.JSDoc ? JSDoc : T extends ts.JSDocAugmentsTag ? JSDocAugmentsTag : T extends ts.JSDocClassTag ? JSDocClassTag : T extends ts.JSDocParameterTag ? JSDocParameterTag : T extends ts.JSDocPropertyTag ? JSDocPropertyTag : T extends ts.JSDocReturnTag ? JSDocReturnTag : T extends ts.JSDocTypedefTag ? JSDocTypedefTag : T extends ts.JSDocTypeTag ? JSDocTypeTag : T extends ts.JSDocUnknownTag ? JSDocUnknownTag : T extends ts.JSDocTag ? JSDocTag : T extends ts.EnumDeclaration ? EnumDeclaration : T extends ts.EnumMember ? EnumMember : T extends ts.AsExpression ? AsExpression : T extends ts.AwaitExpression ? AwaitExpression : T extends ts.CallExpression ? CallExpression : T extends ts.CommaListExpression ? CommaListExpression : T extends ts.ConditionalExpression ? ConditionalExpression : T extends ts.DeleteExpression ? DeleteExpression : T extends ts.ImportExpression ? ImportExpression : T extends ts.MetaProperty ? MetaProperty : T extends ts.NewExpression ? NewExpression : T extends ts.NonNullExpression ? NonNullExpression : T extends ts.OmittedExpression ? OmittedExpression : T extends ts.ParenthesizedExpression ? ParenthesizedExpression : T extends ts.PartiallyEmittedExpression ? PartiallyEmittedExpression : T extends ts.PostfixUnaryExpression ? PostfixUnaryExpression : T extends ts.PrefixUnaryExpression ? PrefixUnaryExpression : T extends ts.SpreadElement ? SpreadElement : T extends ts.SuperElementAccessExpression ? SuperElementAccessExpression : T extends ts.ElementAccessExpression ? ElementAccessExpression : T extends ts.SuperExpression ? SuperExpression : T extends ts.SuperPropertyAccessExpression ? SuperPropertyAccessExpression : T extends ts.PropertyAccessExpression ? PropertyAccessExpression : T extends ts.ThisExpression ? ThisExpression : T extends ts.TypeAssertion ? TypeAssertion : T extends ts.TypeOfExpression ? TypeOfExpression : T extends ts.VoidExpression ? VoidExpression : T extends ts.YieldExpression ? YieldExpression : T extends ts.ExportAssignment ? ExportAssignment : T extends ts.ExportDeclaration ? ExportDeclaration : T extends ts.ExportSpecifier ? ExportSpecifier : T extends ts.ExternalModuleReference ? ExternalModuleReference : T extends ts.ImportDeclaration ? ImportDeclaration : T extends ts.ImportEqualsDeclaration ? ImportEqualsDeclaration : T extends ts.ImportSpecifier ? ImportSpecifier : T extends ts.SourceFile ? SourceFile : T extends ts.ArrowFunction ? ArrowFunction : T extends ts.FunctionDeclaration ? FunctionDeclaration : T extends ts.FunctionExpression ? FunctionExpression : T extends ts.ParameterDeclaration ? ParameterDeclaration : T extends ts.HeritageClause ? HeritageClause : T extends ts.CallSignatureDeclaration ? CallSignatureDeclaration : T extends ts.ConstructSignatureDeclaration ? ConstructSignatureDeclaration : T extends ts.IndexSignatureDeclaration ? IndexSignatureDeclaration : T extends ts.InterfaceDeclaration ? InterfaceDeclaration : T extends ts.MethodSignature ? MethodSignature : T extends ts.PropertySignature ? PropertySignature : T extends ts.TypeElement ? TypeElement : T extends ts.JsxAttribute ? JsxAttribute : T extends ts.JsxClosingElement ? JsxClosingElement : T extends ts.JsxClosingFragment ? JsxClosingFragment : T extends ts.JsxElement ? JsxElement : T extends ts.JsxExpression ? JsxExpression : T extends ts.JsxFragment ? JsxFragment : T extends ts.JsxOpeningElement ? JsxOpeningElement : T extends ts.JsxOpeningFragment ? JsxOpeningFragment : T extends ts.JsxSelfClosingElement ? JsxSelfClosingElement : T extends ts.JsxSpreadAttribute ? JsxSpreadAttribute : T extends ts.JsxText ? JsxText : T extends ts.BooleanLiteral ? BooleanLiteral : T extends ts.NullLiteral ? NullLiteral : T extends ts.NumericLiteral ? NumericLiteral : T extends ts.RegularExpressionLiteral ? RegularExpressionLiteral : T extends ts.StringLiteral ? StringLiteral : T extends ts.NamespaceDeclaration ? NamespaceDeclaration : T extends ts.Block ? Block : T extends ts.BreakStatement ? BreakStatement : T extends ts.CaseBlock ? CaseBlock : T extends ts.CaseClause ? CaseClause : T extends ts.CatchClause ? CatchClause : T extends ts.ContinueStatement ? ContinueStatement : T extends ts.DebuggerStatement ? DebuggerStatement : T extends ts.DefaultClause ? DefaultClause : T extends ts.DoStatement ? DoStatement : T extends ts.EmptyStatement ? EmptyStatement : T extends ts.ExpressionStatement ? ExpressionStatement : T extends ts.ForInStatement ? ForInStatement : T extends ts.ForOfStatement ? ForOfStatement : T extends ts.ForStatement ? ForStatement : T extends ts.IfStatement ? IfStatement : T extends ts.LabeledStatement ? LabeledStatement : T extends ts.NotEmittedStatement ? NotEmittedStatement : T extends ts.ReturnStatement ? ReturnStatement : T extends ts.SwitchStatement ? SwitchStatement : T extends ts.ThrowStatement ? ThrowStatement : T extends ts.TryStatement ? TryStatement : T extends ts.VariableDeclaration ? VariableDeclaration : T extends ts.VariableDeclarationList ? VariableDeclarationList : T extends ts.VariableStatement ? VariableStatement : T extends ts.WhileStatement ? WhileStatement : T extends ts.IterationStatement ? IterationStatement : T extends ts.WithStatement ? WithStatement : T extends ts.ArrayTypeNode ? ArrayTypeNode : T extends ts.ConstructorTypeNode ? ConstructorTypeNode : T extends ts.ExpressionWithTypeArguments ? ExpressionWithTypeArguments : T extends ts.FunctionTypeNode ? FunctionTypeNode : T extends ts.ImportTypeNode ? ImportTypeNode : T extends ts.IntersectionTypeNode ? IntersectionTypeNode : T extends ts.LiteralTypeNode ? LiteralTypeNode : T extends ts.TupleTypeNode ? TupleTypeNode : T extends ts.TypeAliasDeclaration ? TypeAliasDeclaration : T extends ts.Statement ? Statement : T extends ts.TypeLiteralNode ? TypeLiteralNode : T extends ts.TypeParameterDeclaration ? TypeParameterDeclaration : T extends ts.TypeReferenceNode ? TypeReferenceNode : T extends ts.UnionTypeNode ? UnionTypeNode : T extends ts.TypeNode ? TypeNode : T extends ts.ArrayDestructuringAssignment ? ArrayDestructuringAssignment : T extends ts.ArrayLiteralExpression ? ArrayLiteralExpression : T extends ts.ObjectDestructuringAssignment ? ObjectDestructuringAssignment : T extends ts.AssignmentExpression<any> ? AssignmentExpression : T extends ts.BinaryExpression ? BinaryExpression : T extends ts.ObjectLiteralExpression ? ObjectLiteralExpression : T extends ts.PropertyAssignment ? PropertyAssignment : T extends ts.ShorthandPropertyAssignment ? ShorthandPropertyAssignment : T extends ts.SpreadAssignment ? SpreadAssignment : T extends ts.NoSubstitutionTemplateLiteral ? NoSubstitutionTemplateLiteral : T extends ts.LiteralExpression ? LiteralExpression : T extends ts.TaggedTemplateExpression ? TaggedTemplateExpression : T extends ts.TemplateExpression ? TemplateExpression : T extends ts.PrimaryExpression ? PrimaryExpression : T extends ts.MemberExpression ? MemberExpression : T extends ts.LeftHandSideExpression ? LeftHandSideExpression : T extends ts.UpdateExpression ? UpdateExpression : T extends ts.UnaryExpression ? UnaryExpression : T extends ts.Expression ? Expression : T extends ts.TemplateHead ? TemplateHead : T extends ts.TemplateMiddle ? TemplateMiddle : T extends ts.TemplateSpan ? TemplateSpan : T extends ts.TemplateTail ? TemplateTail : Node<T>;

declare const DecoratorBase: typeof Node;

export declare class Decorator extends DecoratorBase<ts.Decorator> {
    /**
     * Gets the decorator name.
     */
    getName(): string;
    /**
     * Gets the name node of the decorator.
     */
    getNameNode(): Identifier;
    /**
     * Gets the full decorator name.
     */
    getFullName(): string;
    /**
     * Gets if the decorator is a decorator factory.
     */
    isDecoratorFactory(): boolean;
    /**
     * Set if this decorator is a decorator factory.
     * @param isDecoratorFactory - If it should be a decorator factory or not.
     */
    setIsDecoratorFactory(isDecoratorFactory: boolean): this;
    /**
     * Gets the call expression if a decorator factory, or throws.
     */
    getCallExpressionOrThrow(): CallExpression;
    /**
     * Gets the call expression if a decorator factory.
     */
    getCallExpression(): CallExpression | undefined;
    /**
     * Gets the expression.
     */
    getExpression(): Expression<ts.LeftHandSideExpression>;
    /**
     * Gets the decorator's arguments from its call expression.
     */
    getArguments(): Node[];
    /**
     * Gets the decorator's type arguments from its call expression.
     */
    getTypeArguments(): TypeNode[];
    /**
     * Adds a type argument.
     * @param argumentTexts - Argument text.
     */
    addTypeArgument(argumentText: string): TypeNode<ts.TypeNode>;
    /**
     * Adds type arguments.
     * @param argumentTexts - Argument texts.
     */
    addTypeArguments(argumentTexts: string[]): TypeNode<ts.TypeNode>[];
    /**
     * Inserts a type argument.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument text.
     */
    insertTypeArgument(index: number, argumentText: string): TypeNode<ts.TypeNode>;
    /**
     * Inserts type arguments.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument texts.
     */
    insertTypeArguments(index: number, argumentTexts: string[]): TypeNode<ts.TypeNode>[];
    /**
     * Removes a type argument.
     * @param typeArg - Type argument to remove.
     */
    removeTypeArgument(typeArg: Node): this;
    /**
     * Removes a type argument.
     * @param index - Index to remove.
     */
    removeTypeArgument(index: number): this;
    /**
     * Adds an argument.
     * @param argumentTexts - Argument text.
     */
    addArgument(argumentText: string): Node<ts.Node>;
    /**
     * Adds arguments.
     * @param argumentTexts - Argument texts.
     */
    addArguments(argumentTexts: string[]): Node<ts.Node>[];
    /**
     * Inserts an argument.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument text.
     */
    insertArgument(index: number, argumentText: string): Node<ts.Node>;
    /**
     * Inserts arguments.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument texts.
     */
    insertArguments(index: number, argumentTexts: string[]): Node<ts.Node>[];
    /**
     * Removes an argument based on the node.
     * @param node - Argument's node to remove.
     */
    removeArgument(node: Node): this;
    /**
     * Removes an argument based on the specified index.
     * @param index - Index to remove.
     */
    removeArgument(index: number): this;
    /**
     * Removes this decorator.
     */
    remove(): void;
}

export declare function JSDocPropertyLikeTag<T extends Constructor<JSDocPropertyLikeTagExtensionType>>(Base: T): Constructor<JSDocPropertyLikeTag> & T;

export interface JSDocPropertyLikeTag {
}

export declare type JSDocPropertyLikeTagExtensionType = Node;

/**
 * JS doc node.
 */
export declare class JSDoc extends Node<ts.JSDoc> {
    /**
     * Gets the tags of the JSDoc.
     */
    getTags(): JSDocTag[];
    /**
     * Gets the comment.
     */
    getComment(): string | undefined;
    /**
     * Gets the JSDoc's text without the surrounding comment.
     */
    getInnerText(): string;
    /**
     * Sets the comment.
     * @param writerFunction - Write the text using the provided writer.
     */
    setComment(writerFunction: WriterFunction): this;
    /**
     * Sets the comment.
     * @param text - Text of the comment.
     */
    setComment(text: string): this;
    /**
     * Removes this JSDoc.
     */
    remove(): void;
}

/**
 * JS doc augments tag node.
 */
export declare class JSDocAugmentsTag extends JSDocTag<ts.JSDocAugmentsTag> {
}

/**
 * JS doc class tag node.
 */
export declare class JSDocClassTag extends JSDocTag<ts.JSDocClassTag> {
}

declare const JSDocParameterTagBase: Constructor<JSDocPropertyLikeTag> & typeof JSDocTag;

/**
 * JS doc parameter tag node.
 */
export declare class JSDocParameterTag extends JSDocParameterTagBase<ts.JSDocParameterTag> {
}

declare const JSDocPropertyTagBase: Constructor<JSDocPropertyLikeTag> & typeof JSDocTag;

/**
 * JS doc property tag node.
 */
export declare class JSDocPropertyTag extends JSDocPropertyTagBase<ts.JSDocPropertyTag> {
}

/**
 * JS doc return tag node.
 */
export declare class JSDocReturnTag extends JSDocTag<ts.JSDocReturnTag> {
}

/**
 * JS doc tag node.
 */
export declare class JSDocTag<NodeType extends ts.JSDocTag = ts.JSDocTag> extends Node<NodeType> {
    /**
     * Gets the at token.
     */
    getAtToken(): Node;
    /**
     * Gets the tag name node.
     */
    getTagNameNode(): Identifier;
    /**
     * Gets the tag's comment.
     */
    getComment(): string | undefined;
}

/**
 * JS doc tag info.
 */
export declare class JSDocTagInfo {
    /** Gets the compiler JS doc tag info. */
    readonly compilerObject: ts.JSDocTagInfo;
    /**
     * Gets the name.
     */
    getName(): string;
    /**
     * Gets the text.
     */
    getText(): string | undefined;
}

/**
 * JS doc type def tag node.
 */
export declare class JSDocTypedefTag extends JSDocTag<ts.JSDocTypedefTag> {
}

/**
 * JS doc type tag node.
 */
export declare class JSDocTypeTag extends JSDocTag<ts.JSDocTypeTag> {
}

/**
 * JS doc unknown tag node.
 */
export declare class JSDocUnknownTag extends JSDocTag<ts.JSDocUnknownTag> {
}

declare const EnumDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<NamespaceChildableNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Statement;

export declare class EnumDeclaration extends EnumDeclarationBase<ts.EnumDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<EnumDeclarationStructure>): this;
    /**
     * Adds a member to the enum.
     * @param structure - Structure of the enum.
     */
    addMember(structure: EnumMemberStructure): EnumMember;
    /**
     * Adds members to the enum.
     * @param structures - Structures of the enums.
     */
    addMembers(structures: EnumMemberStructure[]): EnumMember[];
    /**
     * Inserts a member to the enum.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum.
     */
    insertMember(index: number, structure: EnumMemberStructure): EnumMember;
    /**
     * Inserts members to an enum.
     * @param index - Index to insert at.
     * @param structures - Structures of the enums.
     */
    insertMembers(index: number, structures: EnumMemberStructure[]): EnumMember[];
    /**
     * Gets an enum member.
     * @param name - Name of the member.
     */
    getMember(name: string): EnumMember | undefined;
    /**
     * Gets an enum member.
     * @param findFunction - Function to use to find the member.
     */
    getMember(findFunction: (declaration: EnumMember) => boolean): EnumMember | undefined;
    /**
     * Gets an enum member or throws if not found.
     * @param name - Name of the member.
     */
    getMemberOrThrow(name: string): EnumMember;
    /**
     * Gets an enum member or throws if not found.
     * @param findFunction - Function to use to find the member.
     */
    getMemberOrThrow(findFunction: (declaration: EnumMember) => boolean): EnumMember;
    /**
     * Gets the enum's members.
     */
    getMembers(): EnumMember[];
    /**
     * Toggle if it's a const enum
     */
    setIsConstEnum(value: boolean): this;
    /**
     * Gets if it's a const enum.
     */
    isConstEnum(): boolean;
    /**
     * Gets the const enum keyword or undefined if not exists.
     */
    getConstKeyword(): Node<ts.Node> | undefined;
}

declare const EnumMemberBase: Constructor<JSDocableNode> & Constructor<InitializerExpressionableNode> & Constructor<PropertyNamedNode> & typeof Node;

export declare class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<EnumMemberStructure>): this;
    /**
     * Gets the constant value of the enum.
     */
    getValue(): string | number | undefined;
    /**
     * Sets the enum value.
     * @param value - Enum value.
     */
    setValue(value: string | number): this;
    /**
     * Removes this enum member.
     */
    remove(): void;
}

declare const ArrayDestructuringAssignmentBase: typeof AssignmentExpression;

export declare class ArrayDestructuringAssignment extends ArrayDestructuringAssignmentBase<ts.ArrayDestructuringAssignment, ts.EqualsToken> {
    /**
     * Gets the left array literal expression of the array destructuring assignment.
     */
    getLeft(): ArrayLiteralExpression;
}

export declare class ArrayLiteralExpression extends PrimaryExpression<ts.ArrayLiteralExpression> {
    /**
     * Gets the array's elements.
     */
    getElements(): Expression[];
    /**
     * Adds an element to the array.
     * @param text - Text to add as an element.
     * @param options - Options.
     */
    addElement(text: string, options?: {
        useNewLines?: boolean;
    }): Expression<ts.Expression>;
    /**
     * Adds elements to the array.
     * @param texts - Texts to add as elements.
     * @param options - Options.
     */
    addElements(texts: string[], options?: {
        useNewLines?: boolean;
    }): Expression<ts.Expression>[];
    /**
     * Insert an element into the array.
     * @param index - Index to insert at.
     * @param text - Text to insert as an element.
     * @param options - Options.
     */
    insertElement(index: number, text: string, options?: {
        useNewLines?: boolean;
    }): Expression<ts.Expression>;
    /**
     * Insert elements into the array.
     * @param index - Index to insert at.
     * @param texts - Texts to insert as elements.
     * @param options - Options.
     */
    insertElements(index: number, texts: string[], options?: {
        useNewLines?: boolean;
    }): Expression[];
    /**
     * Insert elements into the array.
     * @param index - Index to insert at.
     * @param writerFunction - Write the text using the provided writer.
     * @param options - Options.
     */
    insertElements(index: number, writerFunction: WriterFunction, options?: {
        useNewLines?: boolean;
    }): Expression[];
    /**
     * Removes an element from the array.
     * @param index - Index to remove from.
     */
    removeElement(index: number): void;
    /**
     * Removes an element from the array.
     * @param element - Element to remove.
     */
    removeElement(element: Expression): void;
}

declare const AsExpressionBase: Constructor<TypedNode> & Constructor<ExpressionedNode> & typeof Expression;

export declare class AsExpression extends AsExpressionBase<ts.AsExpression> {
}

declare const AssignmentExpressionBase: typeof BinaryExpression;

export declare class AssignmentExpression<T extends ts.AssignmentExpression<TOperator> = ts.AssignmentExpression<TOperator>, TOperator extends ts.AssignmentOperatorToken = ts.AssignmentOperatorToken> extends AssignmentExpressionBase<T> {
    /**
     * Gets the operator token of the assignment expression.
     */
    getOperatorToken(): CompilerNodeToWrappedType<TOperator>;
}

declare const AwaitExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;

export declare class AwaitExpression extends AwaitExpressionBase<ts.AwaitExpression> {
}

declare const BinaryExpressionBase: typeof Expression;

export declare class BinaryExpression<T extends ts.BinaryExpression = ts.BinaryExpression> extends BinaryExpressionBase<T> {
    /**
     * Gets the left side of the binary expression.
     */
    getLeft(): Expression;
    /**
     * Gets the operator token of the binary expression.
     */
    getOperatorToken(): Node<ts.Token<ts.BinaryOperator>>;
    /**
     * Gets the right side of the binary expression.
     */
    getRight(): Expression;
}

declare const CallExpressionBase: Constructor<TypeArgumentedNode> & Constructor<ArgumentedNode> & Constructor<LeftHandSideExpressionedNode> & typeof LeftHandSideExpression;

export declare class CallExpression<T extends ts.CallExpression = ts.CallExpression> extends CallExpressionBase<T> {
    /**
     * Gets the return type of the call expression.
     */
    getReturnType(): Type;
}

declare const CommaListExpressionBase: typeof Expression;

export declare class CommaListExpression extends CommaListExpressionBase<ts.CommaListExpression> {
    /**
     * Gets the elements.
     */
    getElements(): Expression[];
}

declare const ConditionalExpressionBase: typeof Expression;

export declare class ConditionalExpression extends ConditionalExpressionBase<ts.ConditionalExpression> {
    /**
     * Gets the condition of the conditional expression.
     */
    getCondition(): Expression;
    /**
     * Gets the question token of the conditional expression.
     */
    getQuestionToken(): Node<ts.Token<SyntaxKind.QuestionToken>>;
    /**
     * Gets the when true expression of the conditional expression.
     */
    getWhenTrue(): Expression;
    /**
     * Gets the colon token of the conditional expression.
     */
    getColonToken(): Node<ts.Token<SyntaxKind.ColonToken>>;
    /**
     * Gets the when false expression of the conditional expression.
     */
    getWhenFalse(): Expression;
}

declare const DeleteExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;

export declare class DeleteExpression extends DeleteExpressionBase<ts.DeleteExpression> {
}

declare const ElementAccessExpressionBase: Constructor<LeftHandSideExpressionedNode> & typeof MemberExpression;

export declare class ElementAccessExpression<T extends ts.ElementAccessExpression = ts.ElementAccessExpression> extends ElementAccessExpressionBase<T> {
    /**
     * Gets this element access expression's argument expression or undefined if none exists.
     */
    getArgumentExpression(): Expression | undefined;
    /**
     * Gets this element access expression's argument expression or throws if none exists.
     */
    getArgumentExpressionOrThrow(): Expression<ts.Expression>;
}

export declare class Expression<T extends ts.Expression = ts.Expression> extends Node<T> {
    /**
     * Gets the contextual type of the expression.
     */
    getContextualType(): Type | undefined;
}

export declare function ExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>>(Base: T): Constructor<ExpressionedNode> & T;

export interface ExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): Expression;
}

export declare type ExpressionedNodeExtensionType = Node<ts.Node & {
    expression: ts.Expression;
}>;

export declare function ImportExpressionedNode<T extends Constructor<ImportExpressionedNodeExtensionType>>(Base: T): Constructor<ImportExpressionedNode> & T;

export interface ImportExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): ImportExpression;
}

export declare type ImportExpressionedNodeExtensionType = Node<ts.Node & {
    expression: ts.ImportExpression;
}>;

export declare function LeftHandSideExpressionedNode<T extends Constructor<LeftHandSideExpressionedNodeExtensionType>>(Base: T): Constructor<LeftHandSideExpressionedNode> & T;

export interface LeftHandSideExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): LeftHandSideExpression;
}

export declare type LeftHandSideExpressionedNodeExtensionType = Node<ts.Node & {
    expression: ts.LeftHandSideExpression;
}>;

export declare function SuperExpressionedNode<T extends Constructor<SuperExpressionedNodeExtensionType>>(Base: T): Constructor<SuperExpressionedNode> & T;

export interface SuperExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): SuperExpression;
}

export declare type SuperExpressionedNodeExtensionType = Node<ts.Node & {
    expression: ts.SuperExpression;
}>;

export declare function UnaryExpressionedNode<T extends Constructor<UnaryExpressionedNodeExtensionType>>(Base: T): Constructor<UnaryExpressionedNode> & T;

export interface UnaryExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): UnaryExpression;
}

export declare type UnaryExpressionedNodeExtensionType = Node<ts.Node & {
    expression: ts.UnaryExpression;
}>;

declare const ImportExpressionBase: typeof PrimaryExpression;

export declare class ImportExpression extends ImportExpressionBase<ts.ImportExpression> {
}

export declare class LeftHandSideExpression<T extends ts.LeftHandSideExpression = ts.LeftHandSideExpression> extends UpdateExpression<T> {
}

declare const LiteralExpressionBase: Constructor<LiteralLikeNode> & typeof PrimaryExpression;

export declare class LiteralExpression<T extends ts.LiteralExpression = ts.LiteralExpression> extends LiteralExpressionBase<T> {
}

export declare class MemberExpression<T extends ts.MemberExpression = ts.MemberExpression> extends LeftHandSideExpression<T> {
}

declare const MetaPropertyBase: Constructor<NamedNode> & typeof PrimaryExpression;

export declare class MetaProperty extends MetaPropertyBase<ts.MetaProperty> {
    /**
     * Gets the keyword token.
     */
    getKeywordToken(): SyntaxKind.ImportKeyword | SyntaxKind.NewKeyword;
}

declare const NewExpressionBase: Constructor<TypeArgumentedNode> & Constructor<ArgumentedNode> & Constructor<LeftHandSideExpressionedNode> & typeof PrimaryExpression;

export declare class NewExpression extends NewExpressionBase<ts.NewExpression> {
}

declare const NonNullExpressionBase: Constructor<ExpressionedNode> & typeof LeftHandSideExpression;

export declare class NonNullExpression extends NonNullExpressionBase<ts.NonNullExpression> {
}

declare const ObjectDestructuringAssignmentBase: typeof AssignmentExpression;

export declare class ObjectDestructuringAssignment extends ObjectDestructuringAssignmentBase<ts.ObjectDestructuringAssignment, ts.EqualsToken> {
    /**
     * Gets the left object literal expression of the object destructuring assignment.
     */
    getLeft(): ObjectLiteralExpression;
}

declare const ObjectLiteralExpressionBase: typeof PrimaryExpression;

export declare class ObjectLiteralExpression extends ObjectLiteralExpressionBase<ts.ObjectLiteralExpression> {
    /**
     * Gets the first property by the provided name or throws.
     * @param name - Name of the property.
     */
    getPropertyOrThrow(name: string): ObjectLiteralElementLike;
    /**
     * Gets the first property that matches the provided find function or throws.
     * @param findFunction - Find function.
     */
    getPropertyOrThrow(findFunction: (property: ObjectLiteralElementLike) => boolean): ObjectLiteralElementLike;
    /**
     * Gets the first property by the provided name or returns undefined.
     * @param name - Name of the property.
     */
    getProperty(name: string): ObjectLiteralElementLike | undefined;
    /**
     * Gets the first property that matches the provided find function or returns undefined.
     * @param findFunction - Find function.
     */
    getProperty(findFunction: (property: ObjectLiteralElementLike) => boolean): ObjectLiteralElementLike | undefined;
    /**
     * Gets the properties.
     */
    getProperties(): ObjectLiteralElementLike[];
    /**
     * Adds a property assignment.
     * @param structure - Structure that represents the property assignment to add.
     */
    addPropertyAssignment(structure: PropertyAssignmentStructure): PropertyAssignment;
    /**
     * Adds property assignments.
     * @param structures - Structure that represents the property assignments to add.
     */
    addPropertyAssignments(structures: PropertyAssignmentStructure[]): PropertyAssignment[];
    /**
     * Inserts a property assignment at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the property assignment to insert.
     */
    insertPropertyAssignment(index: number, structure: PropertyAssignmentStructure): PropertyAssignment;
    /**
     * Inserts property assignments at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the property assignments to insert.
     */
    insertPropertyAssignments(index: number, structures: PropertyAssignmentStructure[]): PropertyAssignment[];
    /**
     * Adds a shorthand property assignment.
     * @param structure - Structure that represents the shorthand property assignment to add.
     */
    addShorthandPropertyAssignment(structure: ShorthandPropertyAssignmentStructure): ShorthandPropertyAssignment;
    /**
     * Adds shorthand property assignments.
     * @param structures - Structure that represents the shorthand property assignments to add.
     */
    addShorthandPropertyAssignments(structures: ShorthandPropertyAssignmentStructure[]): ShorthandPropertyAssignment[];
    /**
     * Inserts a shorthand property assignment at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the shorthand property assignment to insert.
     */
    insertShorthandPropertyAssignment(index: number, structure: ShorthandPropertyAssignmentStructure): ShorthandPropertyAssignment;
    /**
     * Inserts shorthand property assignments at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the shorthand property assignments to insert.
     */
    insertShorthandPropertyAssignments(index: number, structures: ShorthandPropertyAssignmentStructure[]): ShorthandPropertyAssignment[];
    /**
     * Adds a spread assignment.
     * @param structure - Structure that represents the spread assignment to add.
     */
    addSpreadAssignment(structure: SpreadAssignmentStructure): SpreadAssignment;
    /**
     * Adds spread assignments.
     * @param structures - Structure that represents the spread assignments to add.
     */
    addSpreadAssignments(structures: SpreadAssignmentStructure[]): SpreadAssignment[];
    /**
     * Inserts a spread assignment at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the spread assignment to insert.
     */
    insertSpreadAssignment(index: number, structure: SpreadAssignmentStructure): SpreadAssignment;
    /**
     * Inserts spread assignments at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the spread assignments to insert.
     */
    insertSpreadAssignments(index: number, structures: SpreadAssignmentStructure[]): SpreadAssignment[];
    /**
     * Adds a method.
     * @param structure - Structure that represents the method to add.
     */
    addMethod(structure: MethodDeclarationStructure): MethodDeclaration;
    /**
     * Adds methods.
     * @param structures - Structure that represents the methods to add.
     */
    addMethods(structures: MethodDeclarationStructure[]): MethodDeclaration[];
    /**
     * Inserts a method at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the method to insert.
     */
    insertMethod(index: number, structure: MethodDeclarationStructure): MethodDeclaration;
    /**
     * Inserts methods at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the methods to insert.
     */
    insertMethods(index: number, structures: MethodDeclarationStructure[]): MethodDeclaration[];
    /**
     * Adds a get accessor.
     * @param structure - Structure that represents the property assignment to add.
     */
    addGetAccessor(structure: GetAccessorDeclarationStructure): GetAccessorDeclaration;
    /**
     * Adds get accessors.
     * @param structures - Structure that represents the get accessors to add.
     */
    addGetAccessors(structures: GetAccessorDeclarationStructure[]): GetAccessorDeclaration[];
    /**
     * Inserts a get accessor at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the get accessor to insert.
     */
    insertGetAccessor(index: number, structure: GetAccessorDeclarationStructure): GetAccessorDeclaration;
    /**
     * Inserts get accessors at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the get accessors to insert.
     */
    insertGetAccessors(index: number, structures: GetAccessorDeclarationStructure[]): GetAccessorDeclaration[];
    /**
     * Adds a set accessor.
     * @param structure - Structure that represents the property assignment to add.
     */
    addSetAccessor(structure: SetAccessorDeclarationStructure): SetAccessorDeclaration;
    /**
     * Adds set accessors.
     * @param structures - Structure that represents the set accessors to add.
     */
    addSetAccessors(structures: SetAccessorDeclarationStructure[]): SetAccessorDeclaration[];
    /**
     * Inserts a set accessor at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the set accessor to insert.
     */
    insertSetAccessor(index: number, structure: SetAccessorDeclarationStructure): SetAccessorDeclaration;
    /**
     * Inserts set accessors at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the set accessors to insert.
     */
    insertSetAccessors(index: number, structures: SetAccessorDeclarationStructure[]): SetAccessorDeclaration[];
}

declare const PropertyAssignmentBase: Constructor<InitializerGetExpressionableNode> & Constructor<QuestionTokenableNode> & Constructor<PropertyNamedNode> & typeof Node;

export declare class PropertyAssignment extends PropertyAssignmentBase<ts.PropertyAssignment> {
    /**
     * Removes the initializer and returns the new shorthand property assignment.
     *
     * Note: The current node will no longer be valid because it's no longer a property assignment.
     */
    removeInitializer(): ShorthandPropertyAssignment;
    /**
     * Sets the initializer.
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): this;
    /**
     * Sets the initializer.
     * @param writerFunction - Writer function to set the initializer with.
     */
    setInitializer(writerFunction: WriterFunction): this;
    /**
     * Removes this property.
     */
    remove(): void;
}

declare const ShorthandPropertyAssignmentBase: Constructor<InitializerGetExpressionableNode> & Constructor<QuestionTokenableNode> & Constructor<NamedNode> & typeof Node;

export declare class ShorthandPropertyAssignment extends ShorthandPropertyAssignmentBase<ts.ShorthandPropertyAssignment> {
    /**
     * Gets if the shorthand property assignment has an object assignment initializer.
     */
    hasObjectAssignmentInitializer(): boolean;
    /**
     * Gets the object assignment initializer or throws if it doesn't exist.
     */
    getObjectAssignmentInitializerOrThrow(): Expression<ts.Expression>;
    /**
     * Gets the object assignment initializer if it exists.
     */
    getObjectAssignmentInitializer(): Expression | undefined;
    /**
     * Gets the equals token or throws if it doesn't exist.
     */
    getEqualsTokenOrThrow(): Node<ts.Token<SyntaxKind.EqualsToken>>;
    /**
     * Gets the equals token if it exists.
     */
    getEqualsToken(): Node<ts.Token<SyntaxKind.EqualsToken>> | undefined;
    /**
     * Remove the object assignment initializer.
     *
     * This is only useful to remove bad code.
     */
    removeObjectAssignmentInitializer(): this;
    /**
     * Sets the initializer.
     *
     * Note: The current node will no longer be valid because it's no longer a shorthand property assignment.
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): PropertyAssignment;
    /**
     * Removes this property.
     */
    remove(): void;
}

declare const SpreadAssignmentBase: Constructor<ExpressionedNode> & typeof Node;

export declare class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
    /**
     * Removes this property.
     */
    remove(): void;
}

declare const OmittedExpressionBase: typeof Expression;

export declare class OmittedExpression extends OmittedExpressionBase<ts.OmittedExpression> {
}

declare const ParenthesizedExpressionBase: Constructor<ExpressionedNode> & typeof Expression;

export declare class ParenthesizedExpression extends ParenthesizedExpressionBase<ts.ParenthesizedExpression> {
}

declare const PartiallyEmittedExpressionBase: Constructor<ExpressionedNode> & typeof Expression;

export declare class PartiallyEmittedExpression extends PartiallyEmittedExpressionBase<ts.PartiallyEmittedExpression> {
}

declare const PostfixUnaryExpressionBase: typeof UnaryExpression;

export declare class PostfixUnaryExpression extends PostfixUnaryExpressionBase<ts.PostfixUnaryExpression> {
    /**
     * Gets the operator token of the postfix unary expression.
     */
    getOperatorToken(): ts.PostfixUnaryOperator;
    /**
     * Gets the operand of the postfix unary expression.
     */
    getOperand(): LeftHandSideExpression;
}

declare const PrefixUnaryExpressionBase: typeof UnaryExpression;

export declare class PrefixUnaryExpression extends PrefixUnaryExpressionBase<ts.PrefixUnaryExpression> {
    /**
     * Gets the operator token of the prefix unary expression.
     */
    getOperatorToken(): ts.PrefixUnaryOperator;
    /**
     * Gets the operand of the prefix unary expression.
     */
    getOperand(): UnaryExpression;
}

export declare class PrimaryExpression<T extends ts.PrimaryExpression = ts.PrimaryExpression> extends MemberExpression<T> {
}

declare const PropertyAccessExpressionBase: Constructor<NamedNode> & Constructor<LeftHandSideExpressionedNode> & typeof MemberExpression;

export declare class PropertyAccessExpression<T extends ts.PropertyAccessExpression = ts.PropertyAccessExpression> extends PropertyAccessExpressionBase<T> {
}

declare const SpreadElementBase: Constructor<ExpressionedNode> & typeof Expression;

export declare class SpreadElement extends SpreadElementBase<ts.SpreadElement> {
}

declare const SuperElementAccessExpressionBase: Constructor<SuperExpressionedNode> & typeof ElementAccessExpression;

export declare class SuperElementAccessExpression extends SuperElementAccessExpressionBase<ts.SuperElementAccessExpression> {
}

declare const SuperExpressionBase: typeof PrimaryExpression;

export declare class SuperExpression extends SuperExpressionBase<ts.SuperExpression> {
}

declare const SuperPropertyAccessExpressionBase: Constructor<SuperExpressionedNode> & typeof PropertyAccessExpression;

export declare class SuperPropertyAccessExpression extends SuperPropertyAccessExpressionBase<ts.SuperPropertyAccessExpression> {
}

declare const ThisExpressionBase: typeof PrimaryExpression;

export declare class ThisExpression extends ThisExpressionBase<ts.ThisExpression> {
}

declare const TypeAssertionBase: Constructor<TypedNode> & Constructor<UnaryExpressionedNode> & typeof UnaryExpression;

export declare class TypeAssertion extends TypeAssertionBase<ts.TypeAssertion> {
}

declare const TypeOfExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;

export declare class TypeOfExpression extends TypeOfExpressionBase<ts.TypeOfExpression> {
}

export declare class UnaryExpression<T extends ts.UnaryExpression = ts.UnaryExpression> extends Expression<T> {
}

export declare class UpdateExpression<T extends ts.UpdateExpression = ts.UpdateExpression> extends UnaryExpression<T> {
}

declare const VoidExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;

export declare class VoidExpression extends VoidExpressionBase<ts.VoidExpression> {
}

declare const YieldExpressionBase: Constructor<GeneratorableNode> & typeof Expression;

export declare class YieldExpression extends YieldExpressionBase<ts.YieldExpression> {
    /**
     * Gets the expression or undefined of the yield expression.
     */
    getExpression(): Expression | undefined;
    /**
     * Gets the expression of the yield expression or throws if it does not exist.
     */
    getExpressionOrThrow(): Expression<ts.Expression>;
}

export declare class ExportAssignment extends Statement<ts.ExportAssignment> {
    /**
     * Gets if this is an export equals assignemnt.
     *
     * If this is false, then it's `export default`.
     */
    isExportEquals(): boolean;
    /**
     * Gets the export assignment expression.
     */
    getExpression(): Expression;
}

export declare class ExportDeclaration extends Statement<ts.ExportDeclaration> {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the module specifier.
     */
    setModuleSpecifier(text: string): this;
    /**
     * Sets the import specifier.
     * @param sourceFile - Source file to set the module specifier from.
     */
    setModuleSpecifier(sourceFile: SourceFile): this;
    /**
     * Gets the module specifier or undefined if it doesn't exist.
     */
    getModuleSpecifier(): StringLiteral | undefined;
    /**
     * Gets the module specifier value or undefined if it doesn't exist.
     */
    getModuleSpecifierValue(): string | undefined;
    /**
     * Gets the source file referenced in the module specifier or throws if it can't find it or it doesn't exist.
     */
    getModuleSpecifierSourceFileOrThrow(): SourceFile;
    /**
     * Gets the source file referenced in the module specifier.
     */
    getModuleSpecifierSourceFile(): SourceFile | undefined;
    /**
     * Gets if the module specifier starts with `./` or `../`.
     */
    isModuleSpecifierRelative(): boolean;
    /**
     * Gets if the module specifier exists
     */
    hasModuleSpecifier(): boolean;
    /**
     * Gets if this export declaration is a namespace export.
     */
    isNamespaceExport(): boolean;
    /**
     * Gets if the export declaration has named exports.
     */
    hasNamedExports(): boolean;
    /**
     * Adds a named export.
     * @param structure - Structure that represents the named export.
     */
    addNamedExport(structure: ExportSpecifierStructure): ExportSpecifier;
    /**
     * Adds a named export.
     * @param name - Name of the named export.
     */
    addNamedExport(name: string): ExportSpecifier;
    /**
     * Adds named exports.
     * @param structuresOrNames - Structures or names that represent the named exports.
     */
    addNamedExports(structuresOrNames: (ExportSpecifierStructure | string)[]): ExportSpecifier[];
    /**
     * Inserts a named export.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named export.
     */
    insertNamedExport(index: number, structure: ExportSpecifierStructure): ExportSpecifier;
    /**
     * Inserts a named export.
     * @param index - Index to insert at.
     * @param name - Name of the named export.
     */
    insertNamedExport(index: number, name: string): ExportSpecifier;
    /**
     * Inserts named exports into the export declaration.
     * @param index - Index to insert at.
     * @param structuresOrNames - Structures or names that represent the named exports.
     */
    insertNamedExports(index: number, structuresOrNames: (ExportSpecifierStructure | string)[]): ExportSpecifier[];
    /**
     * Gets the named exports.
     */
    getNamedExports(): ExportSpecifier[];
    /**
     * Changes the export declaration to namespace export. Removes all the named exports.
     */
    toNamespaceExport(): this;
}

export declare class ExportSpecifier extends Node<ts.ExportSpecifier> {
    /**
     * Sets the name of what's being exported.
     */
    setName(name: string): this;
    /**
     * Renames the name of what's being exported.
     */
    renameName(name: string): this;
    /**
     * Gets the name node of what's being exported.
     */
    getNameNode(): Identifier;
    /**
     * Sets the alias for the name being exported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string): this;
    /**
     * Gets the alias identifier, if it exists.
     */
    getAliasIdentifier(): Identifier | undefined;
    /**
     * Gets the export declaration associated with this export specifier.
     */
    getExportDeclaration(): ExportDeclaration;
    /**
     * Gets the local target symbol of the export specifier or throws if it doesn't exist.
     */
    getLocalTargetSymbolOrThrow(): Symbol;
    /**
     * Gets the local target symbol of the export specifier or undefined if it doesn't exist.
     */
    getLocalTargetSymbol(): Symbol | undefined;
    /**
     * Gets all the declarations referenced by the export specifier.
     */
    getLocalTargetDeclarations(): Node[];
    /**
     * Removes the export specifier.
     */
    remove(): void;
}

export declare class ExternalModuleReference extends Node<ts.ExternalModuleReference> {
    /**
     * Gets the expression or undefined of the yield expression.
     */
    getExpression(): Expression | undefined;
    /**
     * Gets the expression of the yield expression or throws if it does not exist.
     */
    getExpressionOrThrow(): Expression<ts.Expression>;
    /**
     * Gets the source file referenced or throws if it can't find it.
     */
    getReferencedSourceFileOrThrow(): SourceFile;
    /**
     * Gets if the external module reference is relative.
     */
    isRelative(): boolean;
    /**
     * Gets the source file referenced or returns undefined if it can't find it.
     */
    getReferencedSourceFile(): SourceFile | undefined;
}
/**
 * Result of refreshing a source file from the file system.
 */
export declare enum FileSystemRefreshResult {
    /** The source file did not change. */
    NoChange = 0,
    /** The source file was updated from the file system. */
    Updated = 1,
    /** The source file was deleted. */
    Deleted = 2
}

export declare class ImportDeclaration extends Statement<ts.ImportDeclaration> {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the module specifier.
     */
    setModuleSpecifier(text: string): this;
    /**
     * Sets the import specifier.
     * @param sourceFile - Source file to set the module specifier from.
     */
    setModuleSpecifier(sourceFile: SourceFile): this;
    /**
     * Gets the module specifier.
     */
    getModuleSpecifier(): StringLiteral;
    /**
     * Gets the module specifier string literal value.
     */
    getModuleSpecifierValue(): string;
    /**
     * Gets the source file referenced in the module specifier or throws if it can't find it.
     */
    getModuleSpecifierSourceFileOrThrow(): SourceFile;
    /**
     * Gets the source file referenced in the module specifier or returns undefined if it can't find it.
     */
    getModuleSpecifierSourceFile(): SourceFile | undefined;
    /**
     * Gets if the module specifier starts with `./` or `../`.
     */
    isModuleSpecifierRelative(): boolean;
    /**
     * Sets the default import.
     * @param text - Text to set as the default import.
     */
    setDefaultImport(text: string): this;
    /**
     * Gets the default import or throws if it doesn't exit.
     */
    getDefaultImportOrThrow(): Identifier;
    /**
     * Gets the default import or returns undefined if it doesn't exist.
     */
    getDefaultImport(): Identifier | undefined;
    /**
     * Sets the namespace import.
     * @param text - Text to set as the namespace import.
     * @throws - InvalidOperationError if a named import exists.
     */
    setNamespaceImport(text: string): this;
    /**
     * Removes the namespace import.
     */
    removeNamespaceImport(): this;
    /**
     * Gets the namespace import if it exists or throws.
     */
    getNamespaceImportOrThrow(): Identifier;
    /**
     * Gets the namespace import, if it exists.
     */
    getNamespaceImport(): Identifier | undefined;
    /**
     * Adds a named import.
     * @param structure - Structure that represents the named import.
     */
    addNamedImport(structure: ImportSpecifierStructure): ImportSpecifier;
    /**
     * Adds a named import.
     * @param name - Name of the named import.
     */
    addNamedImport(name: string): ImportSpecifier;
    /**
     * Adds named imports.
     * @param structuresOrNames - Structures or names that represent the named imports.
     */
    addNamedImports(structuresOrNames: (ImportSpecifierStructure | string)[]): ImportSpecifier[];
    /**
     * Inserts a named import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named import.
     */
    insertNamedImport(index: number, structure: ImportSpecifierStructure): ImportSpecifier;
    /**
     * Inserts a named import.
     * @param index - Index to insert at.
     * @param name - Name of the named import.
     */
    insertNamedImport(index: number, name: string): ImportSpecifier;
    /**
     * Inserts named imports into the import declaration.
     * @param index - Index to insert at.
     * @param structuresOrNames - Structures or names that represent the named imports.
     */
    insertNamedImports(index: number, structuresOrNames: (ImportSpecifierStructure | string)[]): ImportSpecifier[];
    /**
     * Gets the named imports.
     */
    getNamedImports(): ImportSpecifier[];
    /**
     * Removes all the named imports.
     */
    removeNamedImports(): this;
    /**
     * Gets the import clause or throws if it doesn't exist.
     */
    getImportClauseOrThrow(): Node;
    /**
     * Gets the import clause or returns undefined if it doesn't exist.
     */
    getImportClause(): Node | undefined;
}

declare const ImportEqualsDeclarationBase: Constructor<JSDocableNode> & Constructor<NamedNode> & typeof Statement;

export declare class ImportEqualsDeclaration extends ImportEqualsDeclarationBase<ts.ImportEqualsDeclaration> {
    /**
     * Gets the module reference of the import equals declaration.
     */
    getModuleReference(): ModuleReference;
    /**
     * Gets if the external module reference is relative.
     */
    isExternalModuleReferenceRelative(): boolean;
    /**
     * Sets the external module reference.
     * @param externalModuleReference - External module reference as a string.
     */
    setExternalModuleReference(externalModuleReference: string): this;
    /**
     * Sets the external module reference.
     * @param sourceFile - Source file to set the external module reference to.
     */
    setExternalModuleReference(sourceFile: SourceFile): this;
    /**
     * Gets the source file referenced in the external module reference or throws if it doesn't exist.
     */
    getExternalModuleReferenceSourceFileOrThrow(): SourceFile;
    /**
     * Gets the source file referenced in the external module reference or returns undefined if it doesn't exist.
     */
    getExternalModuleReferenceSourceFile(): SourceFile | undefined;
}

export declare class ImportSpecifier extends Node<ts.ImportSpecifier> {
    /**
     * Sets the identifier being imported.
     * @param name - Name being imported.
     */
    setName(name: string): this;
    /**
     * Renames the identifier being imported.
     * @param name - New name.
     */
    renameName(name: string): this;
    /**
     * Gets the name of the import specifier.
     */
    getName(): string;
    /**
     * Gets the name node of what's being imported.
     */
    getNameNode(): Identifier;
    /**
     * Sets the alias for the name being imported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string): this;
    /**
     * Gets the alias identifier, if it exists.
     */
    getAliasIdentifier(): Identifier | undefined;
    /**
     * Gets the import declaration associated with this import specifier.
     */
    getImportDeclaration(): ImportDeclaration;
    /**
     * Remove the import specifier.
     */
    remove(): void;
}

export interface SourceFileCopyOptions {
    overwrite?: boolean;
}

export interface SourceFileMoveOptions {
    overwrite?: boolean;
}

/**
 * Options for emitting a source file.
 */
export interface SourceFileEmitOptions extends EmitOptionsBase {
}

declare const SourceFileBase: Constructor<StatementedNode> & Constructor<TextInsertableNode> & typeof Node;

export declare class SourceFile extends SourceFileBase<ts.SourceFile> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<SourceFileStructure>): this;
    /**
     * Gets the file path.
     */
    getFilePath(): string;
    /**
     * Gets the file path's base name.
     */
    getBaseName(): string;
    /**
     * Gets the file path's base name without the extension.
     */
    getBaseNameWithoutExtension(): string;
    /**
     * Gets the file path's extension.
     */
    getExtension(): string;
    /**
     * Gets the directory that the source file is contained in.
     */
    getDirectory(): Directory;
    /**
     * Gets the directory path that the source file is contained in.
     */
    getDirectoryPath(): string;
    /**
     * Gets the full text with leading trivia.
     */
    getFullText(): string;
    /**
     * Gets the line number at the provided position.
     * @param pos - Position
     */
    getLineNumberAtPos(pos: number): number;
    /**
     * @deprecated Use getLineNumberAtPos.
     */
    getLineNumberFromPos(pos: number): number;
    /**
     * Gets the length from the start of the line to the provided position.
     * @param pos - Position.
     */
    getColumnAtPos(pos: number): number;
    /**
     * Copy this source file to a new file.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    copy(filePath: string, options?: SourceFileCopyOptions): SourceFile;
    /**
     * Copy this source file to a new file and immediately saves it to the file system asynchronously.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    copyImmediately(filePath: string, options?: SourceFileCopyOptions): Promise<SourceFile>;
    /**
     * Copy this source file to a new file and immediately saves it to the file system synchronously.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    copyImmediatelySync(filePath: string, options?: SourceFileCopyOptions): SourceFile;
    /**
     * Moves this source file to a new file.
     *
     * This will modify the module specifiers in other files that specify this file and the module specifiers in the current file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for moving.
     */
    move(filePath: string, options?: SourceFileMoveOptions): SourceFile;
    /**
     * Moves this source file to a new file and asynchronously updates the file system immediately.
     *
     * This will modify the module specifiers in other files that specify this file and the module specifiers in the current file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for moving.
     */
    moveImmediately(filePath: string, options?: SourceFileMoveOptions): Promise<SourceFile>;
    /**
     * Moves this source file to a new file and synchronously updates the file system immediately.
     *
     * This will modify the module specifiers in other files that specify this file and the module specifiers in the current file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for moving.
     */
    moveImmediatelySync(filePath: string, options?: SourceFileMoveOptions): SourceFile;
    /**
     * Queues a deletion of the file to the file system.
     *
     * The file will be deleted when you call ast.save(). If you wish to immediately delete the file, then use deleteImmediately().
     */
    delete(): void;
    /**
     * Asynchronously deletes the file from the file system.
     */
    deleteImmediately(): Promise<void>;
    /**
     * Synchronously deletes the file from the file system.
     */
    deleteImmediatelySync(): void;
    /**
     * Asynchronously saves this file with any changes.
     */
    save(): Promise<void>;
    /**
     * Synchronously saves this file with any changes.
     */
    saveSync(): void;
    /**
     * Gets any referenced files.
     */
    getReferencedFiles(): SourceFile[];
    /**
     * Gets the source files for any type reference directives.
     */
    getTypeReferenceDirectives(): SourceFile[];
    /**
     * Get any source files that reference this source file.
     */
    getReferencingSourceFiles(): SourceFile[];
    /**
     * Gets the import and exports in other source files that reference this source file.
     */
    getReferencingNodesInOtherSourceFiles(): SourceFileReferencingNodes[];
    /**
     * Gets the string literals in other source files that reference this source file.
     */
    getReferencingLiteralsInOtherSourceFiles(): StringLiteral[];
    /**
     * Gets all the descendant string literals that reference a source file.
     */
    getImportStringLiterals(): StringLiteral[];
    /**
     * Gets the script target of the source file.
     */
    getLanguageVersion(): ScriptTarget;
    /**
     * Gets the language variant of the source file.
     */
    getLanguageVariant(): LanguageVariant;
    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile(): boolean;
    /**
     * Gets if the source file is from an external library.
     */
    isFromExternalLibrary(): boolean;
    /**
     * Gets if this source file has been saved or if the latest changes have been saved.
     */
    isSaved(): boolean;
    /**
     * Adds an import.
     * @param structure - Structure that represents the import.
     */
    addImportDeclaration(structure: ImportDeclarationStructure): ImportDeclaration;
    /**
     * Adds imports.
     * @param structures - Structures that represent the imports.
     */
    addImportDeclarations(structures: ImportDeclarationStructure[]): ImportDeclaration[];
    /**
     * Insert an import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImportDeclaration(index: number, structure: ImportDeclarationStructure): ImportDeclaration;
    /**
     * Insert imports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImportDeclarations(index: number, structures: ImportDeclarationStructure[]): ImportDeclaration[];
    /**
     * Gets the first import declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImportDeclaration(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration | undefined;
    /**
     * Gets the first import declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImportDeclarationOrThrow(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration;
    /**
     * Get the file's import declarations.
     */
    getImportDeclarations(): ImportDeclaration[];
    /**
     * Add export declarations.
     * @param structure - Structure that represents the export.
     */
    addExportDeclaration(structure: ExportDeclarationStructure): ExportDeclaration;
    /**
     * Add export declarations.
     * @param structures - Structures that represent the exports.
     */
    addExportDeclarations(structures: ExportDeclarationStructure[]): ExportDeclaration[];
    /**
     * Insert an export declaration.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportDeclaration(index: number, structure: ExportDeclarationStructure): ExportDeclaration;
    /**
     * Insert export declarations into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportDeclarations(index: number, structures: ExportDeclarationStructure[]): ExportDeclaration[];
    /**
     * Gets the first export declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export declaration by.
     */
    getExportDeclaration(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration | undefined;
    /**
     * Gets the first export declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the export declaration by.
     */
    getExportDeclarationOrThrow(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration;
    /**
     * Get the file's export declarations.
     */
    getExportDeclarations(): ExportDeclaration[];
    /**
     * Gets the export symbols of the source file.
     */
    getExportSymbols(): Symbol[];
    /**
     * Gets all the declarations exported from the file.
     */
    getExportedDeclarations(): Node[];
    /**
     * Add export assignments.
     * @param structure - Structure that represents the export.
     */
    addExportAssignment(structure: ExportAssignmentStructure): ExportAssignment;
    /**
     * Add export assignments.
     * @param structures - Structures that represent the exports.
     */
    addExportAssignments(structures: ExportAssignmentStructure[]): ExportAssignment[];
    /**
     * Insert an export assignment.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportAssignment(index: number, structure: ExportAssignmentStructure): ExportAssignment;
    /**
     * Insert export assignments into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportAssignments(index: number, structures: ExportAssignmentStructure[]): ExportAssignment[];
    /**
     * Gets the first export assignment that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export assignment by.
     */
    getExportAssignment(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment | undefined;
    /**
     * Gets the first export assignment that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the export assignment by.
     */
    getExportAssignmentOrThrow(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment;
    /**
     * Get the file's export assignments.
     */
    getExportAssignments(): ExportAssignment[];
    /**
     * Gets the default export symbol of the file.
     */
    getDefaultExportSymbol(): Symbol | undefined;
    /**
     * Gets the default export symbol of the file or throws if it doesn't exist.
     */
    getDefaultExportSymbolOrThrow(): Symbol;
    /**
     * Gets the syntactic, semantic, and declaration diagnostics.
     */
    getDiagnostics(): Diagnostic[];
    /**
     * Gets the pre-emit diagnostics.
     */
    getPreEmitDiagnostics(): Diagnostic[];
    /**
     * Removes any "export default";
     */
    removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this;
    /**
     * Deindents the line at the specified position.
     * @param pos - Position.
     * @param times - Times to unindent. Specify a negative value to indent.
     */
    unindent(pos: number, times?: number): this;
    /**
     * Deindents the lines within the specified range.
     * @param positionRange - Position range.
     * @param times - Times to unindent. Specify a negative value to indent.
     */
    unindent(positionRange: [number, number], times?: number): this;
    /**
     * Indents the line at the specified position.
     * @param pos - Position.
     * @param times - Times to indent. Specify a negative value to unindent.
     */
    indent(pos: number, times?: number): this;
    /**
     * Indents the lines within the specified range.
     * @param positionRange - Position range.
     * @param times - Times to indent. Specify a negative value to unindent.
     */
    indent(positionRange: [number, number], times?: number): this;
    /**
     * Emits the source file.
     */
    emit(options?: SourceFileEmitOptions): EmitResult;
    /**
     * Gets the emit output of this source file.
     * @param options - Emit options.
     */
    getEmitOutput(options?: {
        emitOnlyDtsFiles?: boolean;
    }): EmitOutput;
    /**
     * Formats the source file text using the internal TypeScript formatting API.
     * @param settings - Format code settings.
     */
    formatText(settings?: FormatCodeSettings): void;
    /**
     * Refresh the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    refreshFromFileSystem(): Promise<FileSystemRefreshResult>;
    /**
     * Synchronously refreshes the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    refreshFromFileSystemSync(): FileSystemRefreshResult;
    /**
     * Gets the relative path to another source file.
     * @param sourceFile - Source file.
     */
    getRelativePathTo(sourceFile: SourceFile): string;
    /**
     * Gets the relative path to another directory.
     * @param directory - Directory.
     */
    getRelativePathTo(directory: Directory): string;
    /**
     * Gets the relative path to the specified source file as a module specifier.
     * @param sourceFile - Source file.
     */
    getRelativePathAsModuleSpecifierTo(sourceFile: SourceFile): string;
    /**
     * Gets the relative path to the specified directory as a module specifier.
     * @param directory - Directory.
     */
    getRelativePathAsModuleSpecifierTo(directory: Directory): string;
    /**
     * Subscribe to when the source file is modified.
     * @param subscription - Subscription.
     * @param subscribe - Optional and defaults to true. Use an explicit false to unsubscribe.
     */
    onModified(subscription: (sender: SourceFile) => void, subscribe?: boolean): this;
    /**
     * Organizes the imports in the file.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     * @param settings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(settings?: FormatCodeSettings, userPreferences?: UserPreferences): this;
    /**
     * Applies the text changes to the source file.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     * @param textChanges - Text changes.
     */
    applyTextChanges(textChanges: TextChange[]): this;
    private _refreshFromFileSystemInternal;
}

declare const ArrowFunctionBase: Constructor<JSDocableNode> & Constructor<TextInsertableNode> & Constructor<BodiedNode> & Constructor<AsyncableNode> & Constructor<StatementedNode> & Constructor<TypeParameteredNode> & Constructor<SignaturedDeclaration> & Constructor<ModifierableNode> & typeof Expression;

export declare class ArrowFunction extends ArrowFunctionBase<ts.ArrowFunction> {
    /**
     * Gets the equals greater than token of the arrow function.
     */
    getEqualsGreaterThan(): Node<ts.Token<SyntaxKind.EqualsGreaterThanToken>>;
}

declare const FunctionDeclarationBase: Constructor<ChildOrderableNode> & Constructor<UnwrappableNode> & Constructor<TextInsertableNode> & Constructor<OverloadableNode> & Constructor<BodyableNode> & Constructor<AsyncableNode> & Constructor<GeneratorableNode> & Constructor<FunctionLikeDeclaration> & Constructor<StatementedNode> & Constructor<AmbientableNode> & Constructor<NamespaceChildableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Node;

export declare class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<FunctionDeclarationStructure>): this;
    /**
     * Adds a function overload.
     * @param structure - Structure of the overload.
     */
    addOverload(structure: FunctionDeclarationOverloadStructure): FunctionDeclaration;
    /**
     * Adds function overloads.
     * @param structures - Structures of the overloads.
     */
    addOverloads(structures: FunctionDeclarationOverloadStructure[]): FunctionDeclaration[];
    /**
     * Inserts a function overload.
     * @param index - Index to insert.
     * @param structure - Structure of the overload.
     */
    insertOverload(index: number, structure: FunctionDeclarationOverloadStructure): FunctionDeclaration;
    /**
     * Inserts function overloads.
     * @param index - Index to insert.
     * @param structure - Structures of the overloads.
     */
    insertOverloads(index: number, structures: FunctionDeclarationOverloadStructure[]): FunctionDeclaration[];
    /**
     * Removes this function declaration.
     */
    remove(): void;
}

declare const FunctionExpressionBase: Constructor<JSDocableNode> & Constructor<TextInsertableNode> & Constructor<BodiedNode> & Constructor<AsyncableNode> & Constructor<GeneratorableNode> & Constructor<StatementedNode> & Constructor<TypeParameteredNode> & Constructor<SignaturedDeclaration> & Constructor<ModifierableNode> & Constructor<NameableNode> & typeof PrimaryExpression;

export declare class FunctionExpression extends FunctionExpressionBase<ts.FunctionExpression> {
}

export declare function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T;

export interface FunctionLikeDeclaration extends JSDocableNode, TypeParameteredNode, SignaturedDeclaration, StatementedNode, ModifierableNode {
}

export declare type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;

export declare function OverloadableNode<T extends Constructor<OverloadableNodeExtensionType>>(Base: T): Constructor<OverloadableNode> & T;

/**
 * Node that supports overloads.
 */
export interface OverloadableNode {
    /**
     * Gets all the overloads associated with this node.
     */
    getOverloads(): this[];
    /**
     * Gets the implementation or undefined if it doesn't exist.
     */
    getImplementation(): this | undefined;
    /**
     * Gets the implementation or throws if it doesn't exist.
     */
    getImplementationOrThrow(): this;
    /**
     * Gets if this is an overload.
     */
    isOverload(): boolean;
    /**
     * Gets if this is the implementation.
     */
    isImplementation(): boolean;
}

export declare type OverloadableNodeExtensionType = Node & BodyableNode;

declare const ParameterDeclarationBase: Constructor<QuestionTokenableNode> & Constructor<DecoratableNode> & Constructor<ScopeableNode> & Constructor<ReadonlyableNode> & Constructor<ModifierableNode> & Constructor<TypedNode> & Constructor<InitializerExpressionableNode> & Constructor<DeclarationNamedNode> & typeof Node;

export declare class ParameterDeclaration extends ParameterDeclarationBase<ts.ParameterDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ParameterDeclarationStructure>): this;
    /**
     * Gets the dot dot dot token (...) for a rest parameter.
     */
    getDotDotDotToken(): Node<ts.Token<SyntaxKind.DotDotDotToken>> | undefined;
    /**
     * Gets if it's a rest parameter.
     */
    isRestParameter(): boolean;
    /**
     * Gets if this is a parameter property.
     */
    isParameterProperty(): boolean;
    /**
     * Sets if it's a rest parameter.
     * @param value - Sets if it's a rest parameter or not.
     */
    setIsRestParameter(value: boolean): this;
    /**
     * Gets if it's optional.
     */
    isOptional(): boolean;
    /**
     * Remove this parameter.
     */
    remove(): void;
}

export declare class HeritageClause extends Node<ts.HeritageClause> {
    /**
     * Gets all the type nodes for the heritage clause.
     */
    getTypeNodes(): ExpressionWithTypeArguments[];
    /**
     * Gets the heritage clause token.
     */
    getToken(): SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword;
    /**
     * Remove the expression from the heritage clause.
     * @param index - Index of the expression to remove.
     */
    removeExpression(index: number): this;
    /**
     * Removes the expression from the heritage clause.
     * @param expressionNode - Expression to remove.
     */
    removeExpression(expressionNode: ExpressionWithTypeArguments): this;
}

declare const CallSignatureDeclarationBase: Constructor<TypeParameteredNode> & Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<SignaturedDeclaration> & typeof TypeElement;

export declare class CallSignatureDeclaration extends CallSignatureDeclarationBase<ts.CallSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<CallSignatureDeclarationStructure>): this;
    /**
     * Removes this call signature.
     */
    remove(): void;
}

declare const ConstructSignatureDeclarationBase: Constructor<TypeParameteredNode> & Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<SignaturedDeclaration> & typeof TypeElement;

export declare class ConstructSignatureDeclaration extends ConstructSignatureDeclarationBase<ts.ConstructSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ConstructSignatureDeclarationStructure>): this;
    /**
     * Removes this construct signature.
     */
    remove(): void;
}

declare const IndexSignatureDeclarationBase: Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<ReadonlyableNode> & Constructor<ModifierableNode> & typeof TypeElement;

export declare class IndexSignatureDeclaration extends IndexSignatureDeclarationBase<ts.IndexSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<IndexSignatureDeclarationStructure>): this;
    /**
     * Gets the key name.
     */
    getKeyName(): string;
    /**
     * Sets the key name.
     * @param name - New name.
     */
    setKeyName(name: string): void;
    /**
     * Gets the key name node.
     */
    getKeyNameNode(): Identifier | Node<ts.ObjectBindingPattern> | Node<ts.ArrayBindingPattern>;
    /**
     * Gets the key type.
     */
    getKeyType(): Type;
    /**
     * Sets the key type.
     * @param type - Type.
     */
    setKeyType(type: string): void;
    /**
     * Gets the key type node.
     */
    getKeyTypeNode(): TypeNode;
    /**
     * Gets the return type.
     */
    getReturnType(): Type<ts.Type>;
    /**
     * Gets the return type node.
     */
    getReturnTypeNode(): TypeNode;
    /**
     * Sets the return type.
     * @param text - Text of the return type.
     */
    setReturnType(text: string): this;
    /**
     * Sets the return type.
     * @param writerFunction - Writer function to write the return type with.
     */
    setReturnType(writerFunction: WriterFunction): this;
    /**
     * Removes this index signature.
     */
    remove(): void;
}

declare const InterfaceDeclarationBase: Constructor<TypeElementMemberedNode> & Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<ExtendsClauseableNode> & Constructor<HeritageClauseableNode> & Constructor<TypeParameteredNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<NamespaceChildableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Statement;

export declare class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<InterfaceDeclarationStructure>): this;
    /**
     * Gets the base types.
     */
    getBaseTypes(): Type[];
    /**
     * Gets the base declarations.
     */
    getBaseDeclarations(): (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[];
    /**
     * Gets all the implementations of the interface.
     *
     * This is similar to "go to implementation."
     */
    getImplementations(): ImplementationLocation[];
}

declare const MethodSignatureBase: Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<QuestionTokenableNode> & Constructor<TypeParameteredNode> & Constructor<SignaturedDeclaration> & Constructor<PropertyNamedNode> & typeof TypeElement;

export declare class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<MethodSignatureStructure>): this;
    /**
     * Removes this method signature.
     */
    remove(): void;
}

declare const PropertySignatureBase: Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<ReadonlyableNode> & Constructor<QuestionTokenableNode> & Constructor<InitializerExpressionableNode> & Constructor<TypedNode> & Constructor<PropertyNamedNode> & Constructor<ModifierableNode> & typeof TypeElement;

export declare class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertySignatureStructure>): this;
    /**
     * Removes this property signature.
     */
    remove(): void;
}

export declare class TypeElement<TNode extends ts.TypeElement = ts.TypeElement> extends Node<TNode> {
}

export declare function JsxAttributedNode<T extends Constructor<JsxAttributedNodeExtensionType>>(Base: T): Constructor<JsxAttributedNode> & T;

export interface JsxAttributedNode {
    /**
     * Gets the JSX element's attributes.
     */
    getAttributes(): JsxAttributeLike[];
    /**
     * Gets an attribute by name or returns undefined when it can't be found.
     * @param name - Name to search for.
     */
    getAttribute(name: string): JsxAttributeLike | undefined;
    /**
     * Gets an attribute by a find function or returns undefined when it can't be found.
     * @param findFunction - Find function.
     */
    getAttribute(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike | undefined;
    /**
     * Gets an attribute by name or throws when it can't be found.
     * @param name - Name to search for.
     */
    getAttributeOrThrow(name: string): JsxAttributeLike;
    /**
     * Gets an attribute by a find function or throws when it can't be found.
     * @param findFunction - Find function.
     */
    getAttributeOrThrow(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike;
    /**
     * Adds an attribute into the element.
     */
    addAttribute(attribute: JsxAttributeStructure): JsxAttributeLike;
    /**
     * Adds attributes into the element.
     */
    addAttributes(attributes: JsxAttributeStructure[]): JsxAttributeLike[];
    /**
     * Inserts an attribute into the element.
     */
    insertAttribute(index: number, attribute: JsxAttributeStructure): JsxAttributeLike;
    /**
     * Inserts attributes into the element.
     */
    insertAttributes(index: number, attributes: JsxAttributeStructure[]): JsxAttributeLike[];
}

export declare type JsxAttributedNodeExtensionType = Node<ts.Node & {
    attributes: ts.JsxAttributes;
}> & JsxTagNamedNode;

export declare function JsxTagNamedNode<T extends Constructor<JsxTagNamedNodeExtensionType>>(Base: T): Constructor<JsxTagNamedNode> & T;

export interface JsxTagNamedNode {
    /**
     * Gets the tag name of the JSX closing element.
     */
    getTagName(): JsxTagNameExpression;
}

export declare type JsxTagNamedNodeExtensionType = Node<ts.Node & {
    tagName: ts.JsxTagNameExpression;
}>;

declare const JsxAttributeBase: Constructor<NamedNode> & typeof Node;

export declare class JsxAttribute extends JsxAttributeBase<ts.JsxAttribute> {
    /**
     * Gets the JSX attribute's initializer or throws if it doesn't exist.
     */
    getInitializerOrThrow(): JsxExpression | StringLiteral;
    /**
     * Gets the JSX attribute's initializer or returns undefined if it doesn't exist.
     */
    getInitializer(): StringLiteral | JsxExpression | undefined;
    /**
     * Removes the JSX attribute.
     */
    remove(): void;
}

declare const JsxClosingElementBase: Constructor<JsxTagNamedNode> & typeof Node;

export declare class JsxClosingElement extends JsxClosingElementBase<ts.JsxClosingElement> {
}

export declare class JsxClosingFragment extends Expression<ts.JsxClosingFragment> {
}

export declare class JsxElement extends PrimaryExpression<ts.JsxElement> {
    /**
     * Gets the children of the JSX element.
     */
    getJsxChildren(): JsxChild[];
    /**
     * Gets the opening element.
     */
    getOpeningElement(): JsxOpeningElement;
    /**
     * Gets the closing element.
     */
    getClosingElement(): JsxClosingElement;
    /**
     * Sets the body text.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: WriterFunction): this;
    /**
     * Sets the body text.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
    /**
     * Sets the body text without surrounding new lines.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyTextInline(writerFunction: WriterFunction): this;
    /**
     * Sets the body text without surrounding new lines.
     * @param text - Text to set as the body.
     */
    setBodyTextInline(text: string): this;
}

export declare class JsxExpression extends Expression<ts.JsxExpression> {
    /**
     * Gets the dot dot dot token (...) or throws if it doesn't exist.
     */
    getDotDotDotTokenOrThrow(): Node<ts.Token<SyntaxKind.DotDotDotToken>>;
    /**
     * Gets the dot dot dot token (...) or returns undefined if it doesn't exist.
     */
    getDotDotDotToken(): Node<ts.Token<SyntaxKind.DotDotDotToken>> | undefined;
    /**
     * Gets the expression or throws if it doesn't exist.
     */
    getExpressionOrThrow(): Expression<ts.Expression>;
    /**
     * Gets the expression or returns undefined if it doesn't exist
     */
    getExpression(): Expression | undefined;
}

export declare class JsxFragment extends PrimaryExpression<ts.JsxFragment> {
    /**
     * Gets the children of the JSX fragment.
     */
    getJsxChildren(): JsxChild[];
    /**
     * Gets the opening fragment.
     */
    getOpeningFragment(): JsxOpeningFragment;
    /**
     * Gets the closing fragment.
     */
    getClosingFragment(): JsxClosingFragment;
}

declare const JsxOpeningElementBase: Constructor<JsxAttributedNode> & Constructor<JsxTagNamedNode> & typeof Expression;

export declare class JsxOpeningElement extends JsxOpeningElementBase<ts.JsxOpeningElement> {
}

export declare class JsxOpeningFragment extends Expression<ts.JsxOpeningFragment> {
}

declare const JsxSelfClosingElementBase: Constructor<JsxAttributedNode> & Constructor<JsxTagNamedNode> & typeof PrimaryExpression;

export declare class JsxSelfClosingElement extends JsxSelfClosingElementBase<ts.JsxSelfClosingElement> {
}

export declare class JsxSpreadAttribute extends Node<ts.JsxSpreadAttribute> {
    /**
     * Gets the JSX spread attribute's expression.
     */
    getExpression(): Expression<ts.Expression>;
    /**
     * Removes the JSX spread attribute.
     */
    remove(): void;
}

export declare class JsxText extends Node<ts.JsxText> {
    /**
     * Gets if the JSX text contains only white spaces.
     */
    containsOnlyWhiteSpaces(): boolean;
}

export interface KindToNodeMappings {
    [kind: number]: Node;
    [SyntaxKind.SourceFile]: SourceFile;
    [SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpression;
    [SyntaxKind.ArrayType]: ArrayTypeNode;
    [SyntaxKind.ArrowFunction]: ArrowFunction;
    [SyntaxKind.AsExpression]: AsExpression;
    [SyntaxKind.AwaitExpression]: AwaitExpression;
    [SyntaxKind.BinaryExpression]: BinaryExpression;
    [SyntaxKind.Block]: Block;
    [SyntaxKind.BreakStatement]: BreakStatement;
    [SyntaxKind.CallExpression]: CallExpression;
    [SyntaxKind.CallSignature]: CallSignatureDeclaration;
    [SyntaxKind.CaseBlock]: CaseBlock;
    [SyntaxKind.CaseClause]: CaseClause;
    [SyntaxKind.CatchClause]: CatchClause;
    [SyntaxKind.ClassDeclaration]: ClassDeclaration;
    [SyntaxKind.Constructor]: ConstructorDeclaration;
    [SyntaxKind.ConstructorType]: ConstructorTypeNode;
    [SyntaxKind.ConstructSignature]: ConstructSignatureDeclaration;
    [SyntaxKind.ContinueStatement]: ContinueStatement;
    [SyntaxKind.CommaListExpression]: CommaListExpression;
    [SyntaxKind.ComputedPropertyName]: ComputedPropertyName;
    [SyntaxKind.ConditionalExpression]: ConditionalExpression;
    [SyntaxKind.DebuggerStatement]: DebuggerStatement;
    [SyntaxKind.Decorator]: Decorator;
    [SyntaxKind.DefaultClause]: DefaultClause;
    [SyntaxKind.DeleteExpression]: DeleteExpression;
    [SyntaxKind.DoStatement]: DoStatement;
    [SyntaxKind.ElementAccessExpression]: ElementAccessExpression;
    [SyntaxKind.EmptyStatement]: EmptyStatement;
    [SyntaxKind.EnumDeclaration]: EnumDeclaration;
    [SyntaxKind.EnumMember]: EnumMember;
    [SyntaxKind.ExportAssignment]: ExportAssignment;
    [SyntaxKind.ExportDeclaration]: ExportDeclaration;
    [SyntaxKind.ExportSpecifier]: ExportSpecifier;
    [SyntaxKind.ExpressionWithTypeArguments]: ExpressionWithTypeArguments;
    [SyntaxKind.ExpressionStatement]: ExpressionStatement;
    [SyntaxKind.ExternalModuleReference]: ExternalModuleReference;
    [SyntaxKind.QualifiedName]: QualifiedName;
    [SyntaxKind.FirstNode]: QualifiedName;
    [SyntaxKind.ForInStatement]: ForInStatement;
    [SyntaxKind.ForOfStatement]: ForOfStatement;
    [SyntaxKind.ForStatement]: ForStatement;
    [SyntaxKind.FunctionDeclaration]: FunctionDeclaration;
    [SyntaxKind.FunctionExpression]: FunctionExpression;
    [SyntaxKind.FunctionType]: FunctionTypeNode;
    [SyntaxKind.GetAccessor]: GetAccessorDeclaration;
    [SyntaxKind.HeritageClause]: HeritageClause;
    [SyntaxKind.Identifier]: Identifier;
    [SyntaxKind.IfStatement]: IfStatement;
    [SyntaxKind.ImportDeclaration]: ImportDeclaration;
    [SyntaxKind.ImportEqualsDeclaration]: ImportEqualsDeclaration;
    [SyntaxKind.ImportSpecifier]: ImportSpecifier;
    [SyntaxKind.ImportType]: ImportTypeNode;
    [SyntaxKind.LastTypeNode]: ImportTypeNode;
    [SyntaxKind.IndexSignature]: IndexSignatureDeclaration;
    [SyntaxKind.InterfaceDeclaration]: InterfaceDeclaration;
    [SyntaxKind.IntersectionType]: IntersectionTypeNode;
    [SyntaxKind.JSDocTag]: JSDocUnknownTag;
    [SyntaxKind.FirstJSDocTagNode]: JSDocUnknownTag;
    [SyntaxKind.JSDocAugmentsTag]: JSDocAugmentsTag;
    [SyntaxKind.JSDocClassTag]: JSDocClassTag;
    [SyntaxKind.JSDocReturnTag]: JSDocReturnTag;
    [SyntaxKind.JSDocTypeTag]: JSDocTypeTag;
    [SyntaxKind.JSDocTypedefTag]: JSDocTypedefTag;
    [SyntaxKind.JSDocParameterTag]: JSDocParameterTag;
    [SyntaxKind.JSDocPropertyTag]: JSDocPropertyTag;
    [SyntaxKind.LastJSDocNode]: JSDocPropertyTag;
    [SyntaxKind.LastJSDocTagNode]: JSDocPropertyTag;
    [SyntaxKind.JsxAttribute]: JsxAttribute;
    [SyntaxKind.JsxClosingElement]: JsxClosingElement;
    [SyntaxKind.JsxClosingFragment]: JsxClosingFragment;
    [SyntaxKind.JsxElement]: JsxElement;
    [SyntaxKind.JsxExpression]: JsxExpression;
    [SyntaxKind.JsxFragment]: JsxFragment;
    [SyntaxKind.JsxOpeningElement]: JsxOpeningElement;
    [SyntaxKind.JsxOpeningFragment]: JsxOpeningFragment;
    [SyntaxKind.JsxSelfClosingElement]: JsxSelfClosingElement;
    [SyntaxKind.JsxSpreadAttribute]: JsxSpreadAttribute;
    [SyntaxKind.JsxText]: JsxText;
    [SyntaxKind.LabeledStatement]: LabeledStatement;
    [SyntaxKind.LiteralType]: LiteralTypeNode;
    [SyntaxKind.MetaProperty]: MetaProperty;
    [SyntaxKind.MethodDeclaration]: MethodDeclaration;
    [SyntaxKind.MethodSignature]: MethodSignature;
    [SyntaxKind.ModuleDeclaration]: NamespaceDeclaration;
    [SyntaxKind.NewExpression]: NewExpression;
    [SyntaxKind.NonNullExpression]: NonNullExpression;
    [SyntaxKind.NotEmittedStatement]: NotEmittedStatement;
    [SyntaxKind.NoSubstitutionTemplateLiteral]: NoSubstitutionTemplateLiteral;
    [SyntaxKind.LastLiteralToken]: NoSubstitutionTemplateLiteral;
    [SyntaxKind.FirstTemplateToken]: NoSubstitutionTemplateLiteral;
    [SyntaxKind.NumericLiteral]: NumericLiteral;
    [SyntaxKind.FirstLiteralToken]: NumericLiteral;
    [SyntaxKind.ObjectLiteralExpression]: ObjectLiteralExpression;
    [SyntaxKind.OmittedExpression]: OmittedExpression;
    [SyntaxKind.Parameter]: ParameterDeclaration;
    [SyntaxKind.ParenthesizedExpression]: ParenthesizedExpression;
    [SyntaxKind.PartiallyEmittedExpression]: PartiallyEmittedExpression;
    [SyntaxKind.PostfixUnaryExpression]: PostfixUnaryExpression;
    [SyntaxKind.PrefixUnaryExpression]: PrefixUnaryExpression;
    [SyntaxKind.PropertyAccessExpression]: PropertyAccessExpression;
    [SyntaxKind.PropertyAssignment]: PropertyAssignment;
    [SyntaxKind.PropertyDeclaration]: PropertyDeclaration;
    [SyntaxKind.PropertySignature]: PropertySignature;
    [SyntaxKind.RegularExpressionLiteral]: RegularExpressionLiteral;
    [SyntaxKind.ReturnStatement]: ReturnStatement;
    [SyntaxKind.SetAccessor]: SetAccessorDeclaration;
    [SyntaxKind.ShorthandPropertyAssignment]: ShorthandPropertyAssignment;
    [SyntaxKind.SpreadAssignment]: SpreadAssignment;
    [SyntaxKind.SpreadElement]: SpreadElement;
    [SyntaxKind.StringLiteral]: StringLiteral;
    [SyntaxKind.SwitchStatement]: SwitchStatement;
    [SyntaxKind.SyntaxList]: SyntaxList;
    [SyntaxKind.TaggedTemplateExpression]: TaggedTemplateExpression;
    [SyntaxKind.TemplateExpression]: TemplateExpression;
    [SyntaxKind.TemplateHead]: TemplateHead;
    [SyntaxKind.TemplateMiddle]: TemplateMiddle;
    [SyntaxKind.TemplateSpan]: TemplateSpan;
    [SyntaxKind.TemplateTail]: TemplateTail;
    [SyntaxKind.LastTemplateToken]: TemplateTail;
    [SyntaxKind.ThrowStatement]: ThrowStatement;
    [SyntaxKind.TryStatement]: TryStatement;
    [SyntaxKind.TupleType]: TupleTypeNode;
    [SyntaxKind.TypeAliasDeclaration]: TypeAliasDeclaration;
    [SyntaxKind.TypeAssertionExpression]: TypeAssertion;
    [SyntaxKind.TypeLiteral]: TypeLiteralNode;
    [SyntaxKind.TypeParameter]: TypeParameterDeclaration;
    [SyntaxKind.TypeReference]: TypeReferenceNode;
    [SyntaxKind.UnionType]: UnionTypeNode;
    [SyntaxKind.VariableDeclaration]: VariableDeclaration;
    [SyntaxKind.VariableDeclarationList]: VariableDeclarationList;
    [SyntaxKind.VariableStatement]: VariableStatement;
    [SyntaxKind.JSDocComment]: JSDoc;
    [SyntaxKind.TypePredicate]: TypeNode;
    [SyntaxKind.FirstTypeNode]: TypeNode;
    [SyntaxKind.SemicolonToken]: Node;
    [SyntaxKind.TypeOfExpression]: TypeOfExpression;
    [SyntaxKind.WhileStatement]: WhileStatement;
    [SyntaxKind.WithStatement]: WithStatement;
    [SyntaxKind.YieldExpression]: YieldExpression;
    [SyntaxKind.AnyKeyword]: Expression;
    [SyntaxKind.BooleanKeyword]: Expression;
    [SyntaxKind.NeverKeyword]: Expression;
    [SyntaxKind.NumberKeyword]: Expression;
    [SyntaxKind.ObjectKeyword]: Expression;
    [SyntaxKind.StringKeyword]: Expression;
    [SyntaxKind.SymbolKeyword]: Expression;
    [SyntaxKind.UndefinedKeyword]: Expression;
    [SyntaxKind.FalseKeyword]: BooleanLiteral;
    [SyntaxKind.TrueKeyword]: BooleanLiteral;
    [SyntaxKind.ImportKeyword]: ImportExpression;
    [SyntaxKind.NullKeyword]: NullLiteral;
    [SyntaxKind.SuperKeyword]: SuperExpression;
    [SyntaxKind.ThisKeyword]: ThisExpression;
    [SyntaxKind.VoidKeyword]: VoidExpression;
}

export interface KindToExpressionMappings {
    [kind: number]: Node;
    [SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpression;
    [SyntaxKind.ArrowFunction]: ArrowFunction;
    [SyntaxKind.AsExpression]: AsExpression;
    [SyntaxKind.AwaitExpression]: AwaitExpression;
    [SyntaxKind.BinaryExpression]: BinaryExpression;
    [SyntaxKind.CallExpression]: CallExpression;
    [SyntaxKind.CommaListExpression]: CommaListExpression;
    [SyntaxKind.ConditionalExpression]: ConditionalExpression;
    [SyntaxKind.DeleteExpression]: DeleteExpression;
    [SyntaxKind.ElementAccessExpression]: ElementAccessExpression;
    [SyntaxKind.FunctionExpression]: FunctionExpression;
    [SyntaxKind.Identifier]: Identifier;
    [SyntaxKind.JsxClosingFragment]: JsxClosingFragment;
    [SyntaxKind.JsxElement]: JsxElement;
    [SyntaxKind.JsxExpression]: JsxExpression;
    [SyntaxKind.JsxFragment]: JsxFragment;
    [SyntaxKind.JsxOpeningElement]: JsxOpeningElement;
    [SyntaxKind.JsxOpeningFragment]: JsxOpeningFragment;
    [SyntaxKind.JsxSelfClosingElement]: JsxSelfClosingElement;
    [SyntaxKind.MetaProperty]: MetaProperty;
    [SyntaxKind.NewExpression]: NewExpression;
    [SyntaxKind.NonNullExpression]: NonNullExpression;
    [SyntaxKind.NoSubstitutionTemplateLiteral]: NoSubstitutionTemplateLiteral;
    [SyntaxKind.LastLiteralToken]: NoSubstitutionTemplateLiteral;
    [SyntaxKind.FirstTemplateToken]: NoSubstitutionTemplateLiteral;
    [SyntaxKind.NumericLiteral]: NumericLiteral;
    [SyntaxKind.FirstLiteralToken]: NumericLiteral;
    [SyntaxKind.ObjectLiteralExpression]: ObjectLiteralExpression;
    [SyntaxKind.OmittedExpression]: OmittedExpression;
    [SyntaxKind.ParenthesizedExpression]: ParenthesizedExpression;
    [SyntaxKind.PartiallyEmittedExpression]: PartiallyEmittedExpression;
    [SyntaxKind.PostfixUnaryExpression]: PostfixUnaryExpression;
    [SyntaxKind.PrefixUnaryExpression]: PrefixUnaryExpression;
    [SyntaxKind.PropertyAccessExpression]: PropertyAccessExpression;
    [SyntaxKind.RegularExpressionLiteral]: RegularExpressionLiteral;
    [SyntaxKind.SpreadElement]: SpreadElement;
    [SyntaxKind.StringLiteral]: StringLiteral;
    [SyntaxKind.TaggedTemplateExpression]: TaggedTemplateExpression;
    [SyntaxKind.TemplateExpression]: TemplateExpression;
    [SyntaxKind.TypeAssertionExpression]: TypeAssertion;
    [SyntaxKind.TypeOfExpression]: TypeOfExpression;
    [SyntaxKind.YieldExpression]: YieldExpression;
    [SyntaxKind.AnyKeyword]: Expression;
    [SyntaxKind.BooleanKeyword]: Expression;
    [SyntaxKind.NeverKeyword]: Expression;
    [SyntaxKind.NumberKeyword]: Expression;
    [SyntaxKind.ObjectKeyword]: Expression;
    [SyntaxKind.StringKeyword]: Expression;
    [SyntaxKind.SymbolKeyword]: Expression;
    [SyntaxKind.UndefinedKeyword]: Expression;
    [SyntaxKind.FalseKeyword]: BooleanLiteral;
    [SyntaxKind.TrueKeyword]: BooleanLiteral;
    [SyntaxKind.ImportKeyword]: ImportExpression;
    [SyntaxKind.NullKeyword]: NullLiteral;
    [SyntaxKind.SuperKeyword]: SuperExpression;
    [SyntaxKind.ThisKeyword]: ThisExpression;
    [SyntaxKind.VoidKeyword]: VoidExpression;
}

declare const BooleanLiteralBase: typeof PrimaryExpression;

export declare class BooleanLiteral extends BooleanLiteralBase<ts.BooleanLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): boolean;
    /**
     * Sets the literal value.
     *
     * Note: For the time being, this forgets the current node and returns the new node.
     * @param value - Value to set.
     */
    setLiteralValue(value: boolean): BooleanLiteral | undefined;
}

declare const NullLiteralBase: typeof PrimaryExpression;

export declare class NullLiteral extends NullLiteralBase<ts.NullLiteral> {
}

declare const NumericLiteralBase: typeof LiteralExpression;

export declare class NumericLiteral extends NumericLiteralBase<ts.NumericLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): number;
    /**
     * Sets the literal value.
     * @param value - Value to set.
     */
    setLiteralValue(value: number): this;
}
/** Quote type for a string literal. */
export declare enum QuoteKind {
    /** Single quote */
    Single = "'",
    /** Double quote */
    Double = "\""
}

declare const RegularExpressionLiteralBase: typeof LiteralExpression;

export declare class RegularExpressionLiteral extends RegularExpressionLiteralBase<ts.RegularExpressionLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): RegExp;
    /**
     * Sets the literal value according to a pattern and some flags.
     * @param pattern - Pattern.
     * @param flags - Flags.
     */
    setLiteralValue(pattern: string, flags?: string): this;
    /**
     * Sets the literal value according to a regular expression object.
     * @param regExp - Regular expression.
     */
    setLiteralValue(regExp: RegExp): this;
}

declare const StringLiteralBase: typeof LiteralExpression;

export declare class StringLiteral extends StringLiteralBase<ts.StringLiteral> {
    /**
     * Gets the literal value.
     *
     * This is equivalent to .getLiteralText() for string literals and only exists for consistency with other literals.
     */
    getLiteralValue(): string;
    /**
     * Sets the literal value.
     * @param value - Value to set.
     */
    setLiteralValue(value: string): this;
    /**
     * Gets the quote kind.
     */
    getQuoteKind(): QuoteKind;
}

declare const NoSubstitutionTemplateLiteralBase: typeof LiteralExpression;

export declare class NoSubstitutionTemplateLiteral extends NoSubstitutionTemplateLiteralBase<ts.NoSubstitutionTemplateLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): string;
    /**
     * Sets the literal value.
     *
     * Note: This could possibly replace the node if you add a tagged template.
     * @param value - Value to set.
     * @returns The new node if the kind changed; the current node otherwise.
     */
    setLiteralValue(value: string): TemplateLiteral;
}

export declare class TaggedTemplateExpression extends MemberExpression<ts.TaggedTemplateExpression> {
    /**
     * Gets the tag.
     */
    getTag(): LeftHandSideExpression;
    /**
     * Gets the template literal.
     */
    getTemplate(): TemplateLiteral;
    /**
     * Removes the tag from the tagged template.
     * @returns The new template expression.
     */
    removeTag(): TemplateLiteral;
}

declare const TemplateExpressionBase: typeof PrimaryExpression;

export declare class TemplateExpression extends TemplateExpressionBase<ts.TemplateExpression> {
    /**
     * Gets the template head.
     */
    getHead(): TemplateHead;
    /**
     * Gets the template spans.
     */
    getTemplateSpans(): TemplateSpan[];
    /**
     * Sets the literal value.
     *
     * Note: This could possibly replace the node if you remove all the tagged templates.
     * @param value - Value to set.
     * @returns The new node if the kind changed; the current node otherwise.
     */
    setLiteralValue(value: string): TemplateLiteral;
}

declare const TemplateHeadBase: Constructor<LiteralLikeNode> & typeof Node;

export declare class TemplateHead extends TemplateHeadBase<ts.TemplateHead> {
}

declare const TemplateMiddleBase: Constructor<LiteralLikeNode> & typeof Node;

export declare class TemplateMiddle extends TemplateMiddleBase<ts.TemplateMiddle> {
}

declare const TemplateSpanBase: Constructor<ExpressionedNode> & typeof Node;

export declare class TemplateSpan extends TemplateSpanBase<ts.TemplateSpan> {
    /**
     * Gets the template literal.
     */
    getLiteral(): TemplateMiddle | TemplateTail;
}

declare const TemplateTailBase: Constructor<LiteralLikeNode> & typeof Node;

export declare class TemplateTail extends TemplateTailBase<ts.TemplateTail> {
}

export declare function NamespaceChildableNode<T extends Constructor<NamespaceChildableNodeExtensionType>>(Base: T): Constructor<NamespaceChildableNode> & T;

export interface NamespaceChildableNode {
    /**
     * Gets the parent namespace or undefined if it doesn't exist.
     */
    getParentNamespace(): NamespaceDeclaration | undefined;
}

export declare type NamespaceChildableNodeExtensionType = Node;

declare const NamespaceDeclarationBase: Constructor<ChildOrderableNode> & Constructor<UnwrappableNode> & Constructor<TextInsertableNode> & Constructor<BodiedNode> & Constructor<NamespaceChildableNode> & Constructor<StatementedNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Statement;

export declare class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<NamespaceDeclarationStructure>): this;
    /**
     * Gets the full name of the namespace.
     */
    getName(): string;
    /**
     * Sets the name without renaming references.
     * @param newName - New full namespace name.
     */
    setName(newName: string): this;
    /**
     * Renames the name.
     * @param newName - New name.
     */
    rename(newName: string): this;
    /**
     * Gets the name nodes.
     */
    getNameNodes(): Identifier[];
    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasNamespaceKeyword(): boolean;
    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasModuleKeyword(): boolean;
    /**
     * Set if this namespace has a namespace keyword.
     * @param value - Whether to set it or not.
     */
    setHasNamespaceKeyword(value?: boolean): this;
    /**
     * Set if this namespace has a namepsace keyword.
     * @param value - Whether to set it or not.
     */
    setHasModuleKeyword(value?: boolean): this;
    /**
     * Gets the namespace or module keyword.
     */
    getDeclarationKindKeyword(): Node<ts.Node> | undefined;
}

declare const BlockBase: Constructor<TextInsertableNode> & Constructor<StatementedNode> & typeof Statement;

export declare class Block extends BlockBase<ts.Block> {
}

declare const BreakStatementBase: Constructor<ChildOrderableNode> & typeof Statement;

export declare class BreakStatement extends BreakStatementBase<ts.BreakStatement> {
    /**
     * Gets this break statement's label or undefined if it does not exist.
     */
    getLabel(): Identifier | undefined;
    /**
     * Gets this break statement's label or throw if it does not exist.
     */
    getLabelOrThrow(): Identifier;
}

declare const CaseBlockBase: Constructor<TextInsertableNode> & typeof Node;

export declare class CaseBlock extends CaseBlockBase<ts.CaseBlock> {
    /**
     * Gets the clauses.
     */
    getClauses(): CaseOrDefaultClause[];
    /**
     * Removes the clause at the specified index.
     * @param index - Index.
     */
    removeClause(index: number): this;
    /**
     * Removes the clauses in the specified range.
     * @param indexRange - Index range.
     */
    removeClauses(indexRange: [number, number]): this;
}

declare const CaseClauseBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<StatementedNode> & typeof Node;

export declare class CaseClause extends CaseClauseBase<ts.CaseClause> {
    /**
     * Gets this switch statement's expression.
     */
    getExpression(): Expression;
    /**
     * Removes this case clause.
     */
    remove(): void;
}

declare const CatchClauseBase: typeof Node;

export declare class CatchClause extends CatchClauseBase<ts.CatchClause> {
    /**
     * Gets this catch clause's block.
     */
    getBlock(): Block;
    /**
     * Gets this catch clause's variable declaration or undefined if none exists.
     */
    getVariableDeclaration(): VariableDeclaration | undefined;
    /**
     * Gets this catch clause's variable declaration or throws if none exists.
     */
    getVariableDeclarationOrThrow(): VariableDeclaration;
}

declare const ContinueStatementBase: Constructor<ChildOrderableNode> & typeof Statement;

export declare class ContinueStatement extends ContinueStatementBase<ts.ContinueStatement> {
    /**
     * Gets this continue statement's label or undefined if it does not exist.
     */
    getLabel(): Identifier | undefined;
    /**
     * Gets this continue statement's label or throw if it does not exist.
     */
    getLabelOrThrow(): Identifier;
}

declare const DebuggerStatementBase: typeof Statement;

export declare class DebuggerStatement extends DebuggerStatementBase<ts.DebuggerStatement> {
}

declare const DefaultClauseBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<StatementedNode> & typeof Node;

export declare class DefaultClause extends DefaultClauseBase<ts.DefaultClause> {
    /**
     * Removes the default clause.
     */
    remove(): void;
}

declare const DoStatementBase: typeof IterationStatement;

export declare class DoStatement extends DoStatementBase<ts.DoStatement> {
    /**
     * Gets this do statement's expression.
     */
    getExpression(): Expression;
}

declare const EmptyStatementBase: typeof Statement;

export declare class EmptyStatement extends EmptyStatementBase<ts.EmptyStatement> {
}

declare const ExpressionStatementBase: Constructor<JSDocableNode> & Constructor<ChildOrderableNode> & typeof Statement;

export declare class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
    /**
     * Gets this expression statement's expression.
     */
    getExpression(): Expression;
}

declare const ForInStatementBase: typeof IterationStatement;

export declare class ForInStatement extends ForInStatementBase<ts.ForInStatement> {
    /**
     * Gets this for in statement's initializer.
     */
    getInitializer(): VariableDeclarationList | Expression;
    /**
     * Gets this for in statement's expression.
     */
    getExpression(): Expression;
}

declare const ForOfStatementBase: Constructor<AwaitableNode> & typeof IterationStatement;

export declare class ForOfStatement extends ForOfStatementBase<ts.ForOfStatement> {
    /**
     * Gets this for of statement's initializer.
     */
    getInitializer(): VariableDeclarationList | Expression;
    /**
     * Gets this for of statement's expression.
     */
    getExpression(): Expression;
}

declare const ForStatementBase: typeof IterationStatement;

export declare class ForStatement extends ForStatementBase<ts.ForStatement> {
    /**
     * Gets this for statement's initializer or undefined if none exists.
     */
    getInitializer(): VariableDeclarationList | Expression | undefined;
    /**
     * Gets this for statement's initializer or throws if none exists.
     */
    getInitializerOrThrow(): VariableDeclarationList | Expression<ts.Expression>;
    /**
     * Gets this for statement's condition or undefined if none exists.
     */
    getCondition(): Expression | undefined;
    /**
     * Gets this for statement's condition or throws if none exists.
     */
    getConditionOrThrow(): Expression<ts.Expression>;
    /**
     * Gets this for statement's incrementor.
     */
    getIncrementor(): Expression | undefined;
    /**
     * Gets this for statement's incrementor or throws if none exists.
     */
    getIncrementorOrThrow(): Expression<ts.Expression>;
}

declare const IfStatementBase: Constructor<ChildOrderableNode> & typeof Statement;

export declare class IfStatement extends IfStatementBase<ts.IfStatement> {
    /**
     * Gets this if statement's expression.
     */
    getExpression(): Expression;
    /**
     * Gets this if statement's then statement.
     */
    getThenStatement(): Statement;
    /**
     * Gets this if statement's else statement.
     */
    getElseStatement(): Statement | undefined;
}

declare const IterationStatementBase: Constructor<ChildOrderableNode> & typeof Statement;

export declare class IterationStatement<T extends ts.IterationStatement = ts.IterationStatement> extends IterationStatementBase<T> {
    /**
     * Gets this iteration statement's statement.
     */
    getStatement(): Statement;
}

declare const LabeledStatementBase: Constructor<JSDocableNode> & Constructor<ChildOrderableNode> & typeof Statement;

export declare class LabeledStatement extends LabeledStatementBase<ts.LabeledStatement> {
    /**
     * Gets this labeled statement's label
     */
    getLabel(): Identifier;
    /**
     * Gets this labeled statement's statement
     */
    getStatement(): Statement;
}

declare const NotEmittedStatementBase: typeof Statement;

export declare class NotEmittedStatement extends NotEmittedStatementBase<ts.NotEmittedStatement> {
}

declare const ReturnStatementBase: Constructor<ChildOrderableNode> & typeof Statement;

export declare class ReturnStatement extends ReturnStatementBase<ts.ReturnStatement> {
    /**
     * Gets this return statement's expression if it exists or throws.
     */
    getExpressionOrThrow(): Expression<ts.Expression>;
    /**
     * Gets this return statement's expression if it exists.
     */
    getExpression(): Expression | undefined;
}

export declare class Statement<T extends ts.Statement = ts.Statement> extends Node<T> {
    /**
     * Removes the statement.
     */
    remove(): void;
}

export declare function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T;

export interface StatementedNode {
    /**
     * Gets the node's statements.
     */
    getStatements(): Statement[];
    /**
     * Gets the first statement that matches the provided condition or returns undefined if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatement(findFunction: (statement: Node) => boolean): Statement | undefined;
    /**
     * Gets the first statement that matches the provided condition or throws if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatementOrThrow(findFunction: (statement: Node) => boolean): Statement;
    /**
     * Gets the first statement that matches the provided syntax kind or returns undefined if it doesn't exist.
     * @param kind - Syntax kind to find the node by.
     */
    getStatementByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the first statement that matches the provided syntax kind or throws if it doesn't exist.
     * @param kind - Syntax kind to find the node by.
     */
    getStatementByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Adds statements.
     * @param text - Text of the statement or statements to add.
     * @returns The statements that were added.
     */
    addStatements(text: string): Statement[];
    /**
     * Add statements.
     * @param writerFunction - Write the text using the provided writer.
     * @returns The statements that were added.
     */
    addStatements(writerFunction: WriterFunction): Statement[];
    /**
     * Inserts statements at the specified index.
     * @param index - Index to insert at.
     * @param text - Text of the statement or statements to insert.
     * @returns The statements that were inserted.
     */
    insertStatements(index: number, text: string): Statement[];
    /**
     * Inserts statements at the specified index.
     * @param index - Index to insert at.
     * @param writerFunction - Write the text using the provided writer.
     * @returns The statements that were inserted.
     */
    insertStatements(index: number, writerFunction: WriterFunction): Statement[];
    /**
     * Removes the statement at the specified index.
     * @param index - Index to remove the statement at.
     */
    removeStatement(index: number): this;
    /**
     * Removes the statements at the specified index range.
     * @param indexRange - The start and end inclusive index range to remove.
     */
    removeStatements(indexRange: [number, number]): this;
    /**
     * Adds an class declaration as a child.
     * @param structure - Structure of the class declaration to add.
     */
    addClass(structure: ClassDeclarationStructure): ClassDeclaration;
    /**
     * Adds class declarations as a child.
     * @param structures - Structures of the class declarations to add.
     */
    addClasses(structures: ClassDeclarationStructure[]): ClassDeclaration[];
    /**
     * Inserts an class declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the class declaration to insert.
     */
    insertClass(index: number, structure: ClassDeclarationStructure): ClassDeclaration;
    /**
     * Inserts class declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the class declarations to insert.
     */
    insertClasses(index: number, structures: ClassDeclarationStructure[]): ClassDeclaration[];
    /**
     * Gets the direct class declaration children.
     */
    getClasses(): ClassDeclaration[];
    /**
     * Gets a class.
     * @param name - Name of the class.
     */
    getClass(name: string): ClassDeclaration | undefined;
    /**
     * Gets a class.
     * @param findFunction - Function to use to find the class.
     */
    getClass(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration | undefined;
    /**
     * Gets a class or throws if it doesn't exist.
     * @param name - Name of the class.
     */
    getClassOrThrow(name: string): ClassDeclaration;
    /**
     * Gets a class or throws if it doesn't exist.
     * @param findFunction - Function to use to find the class.
     */
    getClassOrThrow(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration;
    /**
     * Adds an enum declaration as a child.
     * @param structure - Structure of the enum declaration to add.
     */
    addEnum(structure: EnumDeclarationStructure): EnumDeclaration;
    /**
     * Adds enum declarations as a child.
     * @param structures - Structures of the enum declarations to add.
     */
    addEnums(structures: EnumDeclarationStructure[]): EnumDeclaration[];
    /**
     * Inserts an enum declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum declaration to insert.
     */
    insertEnum(index: number, structure: EnumDeclarationStructure): EnumDeclaration;
    /**
     * Inserts enum declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the enum declarations to insert.
     */
    insertEnums(index: number, structures: EnumDeclarationStructure[]): EnumDeclaration[];
    /**
     * Gets the direct enum declaration children.
     */
    getEnums(): EnumDeclaration[];
    /**
     * Gets an enum.
     * @param name - Name of the enum.
     */
    getEnum(name: string): EnumDeclaration | undefined;
    /**
     * Gets an enum.
     * @param findFunction - Function to use to find the enum.
     */
    getEnum(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration | undefined;
    /**
     * Gets an enum or throws if it doesn't exist.
     * @param name - Name of the enum.
     */
    getEnumOrThrow(name: string): EnumDeclaration;
    /**
     * Gets an enum or throws if it doesn't exist.
     * @param findFunction - Function to use to find the enum.
     */
    getEnumOrThrow(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration;
    /**
     * Adds a function declaration as a child.
     * @param structure - Structure of the function declaration to add.
     */
    addFunction(structure: FunctionDeclarationStructure): FunctionDeclaration;
    /**
     * Adds function declarations as a child.
     * @param structures - Structures of the function declarations to add.
     */
    addFunctions(structures: FunctionDeclarationStructure[]): FunctionDeclaration[];
    /**
     * Inserts an function declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the function declaration to insert.
     */
    insertFunction(index: number, structure: FunctionDeclarationStructure): FunctionDeclaration;
    /**
     * Inserts function declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the function declarations to insert.
     */
    insertFunctions(index: number, structures: FunctionDeclarationStructure[]): FunctionDeclaration[];
    /**
     * Gets the direct function declaration children.
     */
    getFunctions(): FunctionDeclaration[];
    /**
     * Gets a function.
     * @param name - Name of the function.
     */
    getFunction(name: string): FunctionDeclaration | undefined;
    /**
     * Gets a function.
     * @param findFunction - Function to use to find the function.
     */
    getFunction(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration | undefined;
    /**
     * Gets a function or throws if it doesn't exist.
     * @param name - Name of the function.
     */
    getFunctionOrThrow(name: string): FunctionDeclaration;
    /**
     * Gets a function or throws if it doesn't exist.
     * @param findFunction - Function to use to find the function.
     */
    getFunctionOrThrow(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration;
    /**
     * Adds a interface declaration as a child.
     * @param structure - Structure of the interface declaration to add.
     */
    addInterface(structure: InterfaceDeclarationStructure): InterfaceDeclaration;
    /**
     * Adds interface declarations as a child.
     * @param structures - Structures of the interface declarations to add.
     */
    addInterfaces(structures: InterfaceDeclarationStructure[]): InterfaceDeclaration[];
    /**
     * Inserts an interface declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the interface declaration to insert.
     */
    insertInterface(index: number, structure: InterfaceDeclarationStructure): InterfaceDeclaration;
    /**
     * Inserts interface declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the interface declarations to insert.
     */
    insertInterfaces(index: number, structures: InterfaceDeclarationStructure[]): InterfaceDeclaration[];
    /**
     * Gets the direct interface declaration children.
     */
    getInterfaces(): InterfaceDeclaration[];
    /**
     * Gets an interface.
     * @param name - Name of the interface.
     */
    getInterface(name: string): InterfaceDeclaration | undefined;
    /**
     * Gets an interface.
     * @param findFunction - Function to use to find the interface.
     */
    getInterface(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration | undefined;
    /**
     * Gets an interface or throws if it doesn't exist.
     * @param name - Name of the interface.
     */
    getInterfaceOrThrow(name: string): InterfaceDeclaration;
    /**
     * Gets an interface or throws if it doesn't exist.
     * @param findFunction - Function to use to find the interface.
     */
    getInterfaceOrThrow(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration;
    /**
     * Adds a namespace declaration as a child.
     * @param structure - Structure of the namespace declaration to add.
     */
    addNamespace(structure: NamespaceDeclarationStructure): NamespaceDeclaration;
    /**
     * Adds namespace declarations as a child.
     * @param structures - Structures of the namespace declarations to add.
     */
    addNamespaces(structures: NamespaceDeclarationStructure[]): NamespaceDeclaration[];
    /**
     * Inserts an namespace declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the namespace declaration to insert.
     */
    insertNamespace(index: number, structure: NamespaceDeclarationStructure): NamespaceDeclaration;
    /**
     * Inserts namespace declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the namespace declarations to insert.
     */
    insertNamespaces(index: number, structures: NamespaceDeclarationStructure[]): NamespaceDeclaration[];
    /**
     * Gets the direct namespace declaration children.
     */
    getNamespaces(): NamespaceDeclaration[];
    /**
     * Gets a namespace.
     * @param name - Name of the namespace.
     */
    getNamespace(name: string): NamespaceDeclaration | undefined;
    /**
     * Gets a namespace.
     * @param findFunction - Function to use to find the namespace.
     */
    getNamespace(findFunction: (declaration: NamespaceDeclaration) => boolean): NamespaceDeclaration | undefined;
    /**
     * Gets a namespace or throws if it doesn't exist.
     * @param name - Name of the namespace.
     */
    getNamespaceOrThrow(name: string): NamespaceDeclaration;
    /**
     * Gets a namespace or throws if it doesn't exist.
     * @param findFunction - Function to use to find the namespace.
     */
    getNamespaceOrThrow(findFunction: (declaration: NamespaceDeclaration) => boolean): NamespaceDeclaration;
    /**
     * Adds a type alias declaration as a child.
     * @param structure - Structure of the type alias declaration to add.
     */
    addTypeAlias(structure: TypeAliasDeclarationStructure): TypeAliasDeclaration;
    /**
     * Adds type alias declarations as a child.
     * @param structures - Structures of the type alias declarations to add.
     */
    addTypeAliases(structures: TypeAliasDeclarationStructure[]): TypeAliasDeclaration[];
    /**
     * Inserts an type alias declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the type alias declaration to insert.
     */
    insertTypeAlias(index: number, structure: TypeAliasDeclarationStructure): TypeAliasDeclaration;
    /**
     * Inserts type alias declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the type alias declarations to insert.
     */
    insertTypeAliases(index: number, structures: TypeAliasDeclarationStructure[]): TypeAliasDeclaration[];
    /**
     * Gets the direct type alias declaration children.
     */
    getTypeAliases(): TypeAliasDeclaration[];
    /**
     * Gets a type alias.
     * @param name - Name of the type alias.
     */
    getTypeAlias(name: string): TypeAliasDeclaration | undefined;
    /**
     * Gets a type alias.
     * @param findFunction - Function to use to find the type alias.
     */
    getTypeAlias(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration | undefined;
    /**
     * Gets a type alias or throws if it doesn't exist.
     * @param name - Name of the type alias.
     */
    getTypeAliasOrThrow(name: string): TypeAliasDeclaration;
    /**
     * Gets a type alias or throws if it doesn't exist.
     * @param findFunction - Function to use to find the type alias.
     */
    getTypeAliasOrThrow(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration;
    /**
     * Adds a variable statement.
     * @param structure - Structure of the variable statement.
     */
    addVariableStatement(structure: VariableStatementStructure): VariableStatement;
    /**
     * Adds variable statements.
     * @param structures - Structures of the variable statements.
     */
    addVariableStatements(structures: VariableStatementStructure[]): VariableStatement[];
    /**
     * Inserts a variable statement.
     * @param structure - Structure of the variable statement.
     */
    insertVariableStatement(index: number, structure: VariableStatementStructure): VariableStatement;
    /**
     * Inserts variable statements.
     * @param structures - Structures of the variable statements.
     */
    insertVariableStatements(index: number, structures: VariableStatementStructure[]): VariableStatement[];
    /**
     * Gets the direct variable statement children.
     */
    getVariableStatements(): VariableStatement[];
    /**
     * Gets a variable statement.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatement(findFunction: (declaration: VariableStatement) => boolean): VariableStatement | undefined;
    /**
     * Gets a variable statement or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatementOrThrow(findFunction: (declaration: VariableStatement) => boolean): VariableStatement;
    /**
     * Gets all the variable declarations within all the variable declarations of the direct variable statement children.
     */
    getVariableDeclarations(): VariableDeclaration[];
    /**
     * Gets a variable declaration.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclaration(name: string): VariableDeclaration | undefined;
    /**
     * Gets a variable declaration.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclaration(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration | undefined;
    /**
     * Gets a variable declaration or throws if it doesn't exist.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclarationOrThrow(name: string): VariableDeclaration;
    /**
     * Gets a variable declaration or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclarationOrThrow(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration;
}

export declare type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration | ts.CaseClause | ts.DefaultClause>;

declare const SwitchStatementBase: Constructor<ChildOrderableNode> & typeof Statement;

export declare class SwitchStatement extends SwitchStatementBase<ts.SwitchStatement> {
    /**
     * Gets this switch statement's expression.
     */
    getExpression(): Expression;
    /**
     * Gets this switch statement's case block.
     */
    getCaseBlock(): CaseBlock;
    /**
     * Gets the switch statement's case block's clauses.
     */
    getClauses(): CaseOrDefaultClause[];
    /**
     * Removes the specified clause based on the provided index.
     * @param index - Index.
     */
    removeClause(index: number): CaseBlock;
    /**
     * Removes the specified clauses based on the provided index range.
     * @param indexRange - Index range.
     */
    removeClauses(indexRange: [number, number]): CaseBlock;
}

declare const ThrowStatementBase: typeof Statement;

export declare class ThrowStatement extends ThrowStatementBase<ts.ThrowStatement> {
    /**
     * Gets this do statement's expression.
     */
    getExpression(): Expression;
}

declare const TryStatementBase: typeof Statement;

export declare class TryStatement extends TryStatementBase<ts.TryStatement> {
    /**
     * Gets this try statement's try block.
     */
    getTryBlock(): Block;
    /**
     * Gets this try statement's catch clause or undefined if none exists.
     */
    getCatchClause(): CatchClause | undefined;
    /**
     * Gets this try statement's catch clause or throws if none exists.
     */
    getCatchClauseOrThrow(): CatchClause;
    /**
     * Gets this try statement's finally block or undefined if none exists.
     */
    getFinallyBlock(): Block | undefined;
    /**
     * Gets this try statement's finally block or throws if none exists.
     */
    getFinallyBlockOrThrow(): Block;
}

declare const VariableDeclarationBase: Constructor<ExclamationTokenableNode> & Constructor<TypedNode> & Constructor<InitializerExpressionableNode> & Constructor<BindingNamedNode> & typeof Node;

export declare class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
    /**
     * Fills this node with the specified structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableDeclarationStructure>): this;
    /**
     * Removes this variable declaration.
     */
    remove(): void;
}
export declare enum VariableDeclarationKind {
    Var = "var",
    Let = "let",
    Const = "const"
}

declare const VariableDeclarationListBase: Constructor<ModifierableNode> & typeof Node;

export declare class VariableDeclarationList extends VariableDeclarationListBase<ts.VariableDeclarationList> {
    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[];
    /**
     * Gets the variable declaration kind.
     */
    getDeclarationKind(): VariableDeclarationKind;
    /**
     * Gets the variable declaration kind keyword.
     */
    getDeclarationKindKeyword(): Node;
    /**
     * Sets the variable declaration kind.
     * @param type - Type to set.
     */
    setDeclarationKind(type: VariableDeclarationKind): this;
    /**
     * Add a variable declaration to the statement.
     * @param structure - Structure representing the variable declaration to add.
     */
    addDeclaration(structure: VariableDeclarationStructure): VariableDeclaration;
    /**
     * Adds variable declarations to the statement.
     * @param structures - Structures representing the variable declarations to add.
     */
    addDeclarations(structures: VariableDeclarationStructure[]): VariableDeclaration[];
    /**
     * Inserts a variable declaration at the specified index within the statement.
     * @param index - Index to insert.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: VariableDeclarationStructure): VariableDeclaration;
    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Index to insert.
     * @param structures - Structures representing the variable declarations to insert.
     */
    insertDeclarations(index: number, structures: VariableDeclarationStructure[]): VariableDeclaration[];
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableDeclarationListStructure>): this;
}

declare const VariableStatementBase: Constructor<ChildOrderableNode> & Constructor<NamespaceChildableNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & typeof Statement;

export declare class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
    /**
     * Get variable declaration list.
     */
    getDeclarationList(): VariableDeclarationList;
    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[];
    /**
     * Gets the variable declaration kind.
     */
    getDeclarationKind(): VariableDeclarationKind;
    /**
     * Gets the variable declaration kind keyword.
     */
    getDeclarationKindKeyword(): Node<ts.Node>;
    /**
     * Sets the variable declaration kind.
     * @param type - Type to set.
     */
    setDeclarationKind(type: VariableDeclarationKind): VariableDeclarationList;
    /**
     * Add a variable declaration to the statement.
     * @param structure - Structure representing the variable declaration to add.
     */
    addDeclaration(structure: VariableDeclarationStructure): VariableDeclaration;
    /**
     * Adds variable declarations to the statement.
     * @param structures - Structures representing the variable declarations to add.
     */
    addDeclarations(structures: VariableDeclarationStructure[]): VariableDeclaration[];
    /**
     * Inserts a variable declaration at the specified index within the statement.
     * @param index - Index to insert.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: VariableDeclarationStructure): VariableDeclaration;
    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Index to insert.
     * @param structures - Structures representing the variable declarations to insert.
     */
    insertDeclarations(index: number, structures: VariableDeclarationStructure[]): VariableDeclaration[];
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableStatementStructure>): this;
}

declare const WhileStatementBase: typeof IterationStatement;

export declare class WhileStatement extends WhileStatementBase<ts.WhileStatement> {
    /**
     * Gets this while statement's expression.
     */
    getExpression(): Expression;
}

declare const WithStatementBase: Constructor<ChildOrderableNode> & typeof Statement;

export declare class WithStatement extends WithStatementBase<ts.WithStatement> {
    /**
     * Gets this with statement's expression.
     */
    getExpression(): Expression;
    /**
     * Gets this with statement's statement.
     */
    getStatement(): Statement;
}

export interface FormatCodeSettings extends ts.FormatCodeSettings {
    ensureNewLineAtEndOfFile?: boolean;
}

/**
 * User preferences for refactoring.
 */
export interface UserPreferences extends ts.UserPreferences {
}

export declare class LanguageService {
    private readonly _compilerObject;
    private readonly compilerHost;
    private program;
    /**
     * Gets the compiler language service.
     */
    readonly compilerObject: ts.LanguageService;
    /**
     * Gets the language service's program.
     */
    getProgram(): Program;
    /**
     * Rename the specified node.
     * @param node - Node to rename.
     * @param newName - New name for the node.
     */
    renameNode(node: Node, newName: string): void;
    /**
     * Rename the provided rename locations.
     * @param renameLocations - Rename locations.
     * @param newName - New name for the node.
     */
    renameLocations(renameLocations: RenameLocation[], newName: string): void;
    /**
     * Gets the definitions for the specified node.
     * @param node - Node.
     */
    getDefinitions(node: Node): DefinitionInfo[];
    /**
     * Gets the definitions at the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position.
     */
    getDefinitionsAtPosition(sourceFile: SourceFile, pos: number): DefinitionInfo[];
    /**
     * Gets the implementations for the specified node.
     * @param node - Node.
     */
    getImplementations(node: Node): ImplementationLocation[];
    /**
     * Gets the implementations at the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position.
     */
    getImplementationsAtPosition(sourceFile: SourceFile, pos: number): ImplementationLocation[];
    /**
     * Finds references based on the specified node.
     * @param node - Node to find references for.
     */
    findReferences(node: Node): ReferencedSymbol[];
    /**
     * Finds the nodes that reference the definition(s) of the specified node.
     * @param node - Node.
     */
    findReferencesAsNodes(node: Node): Node<ts.Node>[];
    /**
     * Finds references based on the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position to find the reference at.
     */
    findReferencesAtPosition(sourceFile: SourceFile, pos: number): ReferencedSymbol[];
    /**
     * Find the rename locations for the specified node.
     * @param node - Node to get the rename locations for.
     */
    findRenameLocations(node: Node): RenameLocation[];
    /**
     * Gets the formatting edits for a range.
     * @param filePath - File path.
     * @param range - Position range.
     * @param settings - Settings.
     */
    getFormattingEditsForRange(filePath: string, range: [number, number], settings: FormatCodeSettings): TextChange[];
    /**
     * Gets the formatting edits for a document.
     * @param filePath - File path of the source file.
     * @param settings - Format code settings.
     */
    getFormattingEditsForDocument(filePath: string, settings: FormatCodeSettings): TextChange[];
    /**
     * Gets the formatted text for a document.
     * @param filePath - File path of the source file.
     * @param settings - Format code settings.
     */
    getFormattedDocumentText(filePath: string, settings: FormatCodeSettings): string;
    /**
     * Gets the emit output of a source file.
     * @param sourceFile - Source file.
     * @param emitOnlyDtsFiles - Whether to only emit the d.ts files.
     */
    getEmitOutput(sourceFile: SourceFile, emitOnlyDtsFiles?: boolean): EmitOutput;
    /**
     * Gets the emit output of a source file.
     * @param filePath - File path.
     * @param emitOnlyDtsFiles - Whether to only emit the d.ts files.
     */
    getEmitOutput(filePath: string, emitOnlyDtsFiles?: boolean): EmitOutput;
    /**
     * Gets the indentation at the specified position.
     * @param sourceFile - Source file.
     * @param position - Position.
     * @param settings - Editor settings.
     */
    getIdentationAtPosition(sourceFile: SourceFile, position: number, settings?: EditorSettings): number;
    /**
     * Gets the indentation at the specified position.
     * @param filePath - File path.
     * @param position - Position.
     * @param settings - Editor settings.
     */
    getIdentationAtPosition(filePath: string, position: number, settings?: EditorSettings): number;
    /**
     * Gets the file text changes for organizing the imports in a source file.
     *
     * @param sourceFile - Source file.
     * @param settings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(sourceFile: SourceFile, settings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
    /**
     * Gets the file text changes for organizing the imports in a source file.
     *
     * @param filePath - File path of the source file.
     * @param settings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(filePath: string, settings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
    private _getFilePathFromFilePathOrSourceFile;
    private _getFilledSettings;
    private _getFilledUserPreferences;
}

/**
 * Options for emitting.
 */
export interface EmitOptions extends EmitOptionsBase {
    /**
     * Optional source file to only emit.
     */
    targetSourceFile?: SourceFile;
}

export interface EmitOptionsBase {
    /**
     * Whether only .d.ts files should be emitted.
     */
    emitOnlyDtsFiles?: boolean;
}

/**
 * Wrapper around Program.
 */
export declare class Program {
    /**
     * Gets the underlying compiler program.
     */
    readonly compilerObject: ts.Program;
    /**
     * Get the program's type checker.
     */
    getTypeChecker(): TypeChecker;
    /**
     * Emits the TypeScript files to the specified target.
     */
    emit(options?: EmitOptions): EmitResult;
    /**
     * Gets the syntactic diagnostics.
     * @param sourceFile - Optional source file.
     */
    getSyntacticDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[];
    /**
     * Gets the semantic diagnostics.
     * @param sourceFile - Optional source file.
     */
    getSemanticDiagnostics(sourceFile?: SourceFile): Diagnostic[];
    /**
     * Gets the declaration diagnostics.
     * @param sourceFile - Optional source file.
     */
    getDeclarationDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[];
    /**
     * Gets the pre-emit diagnostics.
     * @param sourceFile - Source file.
     */
    getPreEmitDiagnostics(sourceFile?: SourceFile): Diagnostic[];
    /**
     * Gets the emit module resolution kind.
     */
    getEmitModuleResolutionKind(): ModuleResolutionKind;
    /**
     * Gets if the provided source file is from an external library.
     * @param sourceFile - Source file.
     */
    isSourceFileFromExternalLibrary(sourceFile: SourceFile): boolean;
}

/**
 * Definition info.
 */
export declare class DefinitionInfo<TCompilerObject extends ts.DefinitionInfo = ts.DefinitionInfo> extends DocumentSpan<TCompilerObject> {
    /**
     * Gets the kind.
     */
    getKind(): ts.ScriptElementKind;
    /**
     * Gets the name.
     */
    getName(): string;
    /**
     * Gets the container kind.
     */
    getContainerKind(): ts.ScriptElementKind;
    /**
     * Gets the container name.
     */
    getContainerName(): string;
    /**
     * Gets the declaration node.
     */
    getDeclarationNode(): Node | undefined;
}

/**
 * Diagnostic.
 */
export declare class Diagnostic<TCompilerObject extends ts.Diagnostic = ts.Diagnostic> {
    /**
     * Gets the underlying compiler diagnostic.
     */
    readonly compilerObject: TCompilerObject;
    /**
     * Gets the source file.
     */
    getSourceFile(): SourceFile | undefined;
    /**
     * Gets the message text.
     */
    getMessageText(): string | DiagnosticMessageChain;
    /**
     * Gets the line number.
     */
    getLineNumber(): number | undefined;
    /**
     * Gets the start.
     */
    getStart(): number | undefined;
    /**
     * Gets the length.
     */
    getLength(): number | undefined;
    /**
     * Gets the diagnostic category.
     */
    getCategory(): DiagnosticCategory;
    /**
     * Gets the code of the diagnostic.
     */
    getCode(): number;
    /**
     * Gets the source.
     */
    getSource(): string | undefined;
}

/**
 * Diagnostic message chain.
 */
export declare class DiagnosticMessageChain {
    /**
     * Gets the underlying compiler object.
     */
    readonly compilerObject: ts.DiagnosticMessageChain;
    /**
     * Gets the message text.
     */
    getMessageText(): string;
    /**
     * Gets th enext diagnostic message chain in the chain.
     */
    getNext(): DiagnosticMessageChain | undefined;
    /**
     * Gets the code of the diagnostic message chain.
     */
    getCode(): number;
    /**
     * Gets the category of the diagnostic message chain.
     */
    getCategory(): DiagnosticCategory;
}

export declare class DiagnosticWithLocation extends Diagnostic<ts.DiagnosticWithLocation> {
    /**
     * Gets the line number.
     */
    getLineNumber(): number;
    /**
     * Gets the start.
     */
    getStart(): number;
    /**
     * Gets the length
     */
    getLength(): number;
    /**
     * Gets the source file.
     */
    getSourceFile(): SourceFile;
}

/**
 * Document span.
 */
export declare class DocumentSpan<TCompilerObject extends ts.DocumentSpan = ts.DocumentSpan> {
    /**
     * Gets the compiler object.
     */
    readonly compilerObject: TCompilerObject;
    /**
     * Gets the source file this reference is in.
     */
    getSourceFile(): SourceFile;
    /**
     * Gets the text span.
     */
    getTextSpan(): TextSpan;
    /**
     * Gets the node at the start of the text span.
     */
    getNode(): Node<ts.Node>;
    /**
     * Gets the original text span if the span represents a location that was remapped.
     */
    getOriginalTextSpan(): TextSpan | undefined;
    /**
     * Gets the original file name if the span represents a location that was remapped.
     */
    getOriginalFileName(): string | undefined;
}

/**
 * Output of an emit on a single file.
 */
export declare class EmitOutput {
    private readonly filePath;
    /**
     * TypeScript compiler emit result.
     */
    readonly compilerObject: ts.EmitOutput;
    /**
     * Gets if the emit was skipped.
     */
    getEmitSkipped(): boolean;
    /**
     * Gets the output files.
     */
    getOutputFiles(): OutputFile[];
}

/**
 * Result of an emit.
 */
export declare class EmitResult {
    /**
     * TypeScript compiler emit result.
     */
    readonly compilerObject: ts.EmitResult;
    /**
     * If the emit was skipped.
     */
    getEmitSkipped(): boolean;
    /**
     * Contains declaration emit diagnostics.
     */
    getDiagnostics(): Diagnostic<ts.Diagnostic>[];
}

export declare class FileTextChanges {
    /**
     * Gets the file path.
     */
    getFilePath(): string;
    /**
     * Gets the text changes
     */
    getTextChanges(): TextChange[];
}

export declare class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
    /**
     * Gets the kind.
     */
    getKind(): ts.ScriptElementKind;
    /**
     * Gets the display parts.
     */
    getDisplayParts(): SymbolDisplayPart[];
}

/**
 * Output file of an emit.
 */
export declare class OutputFile {
    private readonly global;
    /**
     * TypeScript compiler emit result.
     */
    readonly compilerObject: ts.OutputFile;
    /**
     * Gets the file path.
     */
    getFilePath(): string;
    /**
     * Gets whether the byte order mark should be written.
     */
    getWriteByteOrderMark(): boolean;
    /**
     * Gets the file text.
     */
    getText(): string;
}

/**
 * Referenced symbol.
 */
export declare class ReferencedSymbol {
    /**
     * Gets the compiler referenced symbol.
     */
    readonly compilerObject: ts.ReferencedSymbol;
    /**
     * Gets the definition.
     */
    getDefinition(): ReferencedSymbolDefinitionInfo;
    /**
     * Gets the references.
     */
    getReferences(): ReferenceEntry[];
}

export declare class ReferencedSymbolDefinitionInfo extends DefinitionInfo<ts.ReferencedSymbolDefinitionInfo> {
    /**
     * Gets the display parts.
     */
    getDisplayParts(): SymbolDisplayPart[];
}

export declare class ReferenceEntry extends DocumentSpan<ts.ReferenceEntry> {
    isWriteAccess(): boolean;
    /**
     * If this is the definition reference.
     */
    isDefinition(): boolean;
    isInString(): true | undefined;
}

/**
 * Rename location.
 */
export declare class RenameLocation extends DocumentSpan<ts.RenameLocation> {
}

/**
 * Symbol display part.
 */
export declare class SymbolDisplayPart {
    /** Gets the compiler symbol display part. */
    readonly compilerObject: ts.SymbolDisplayPart;
    /**
     * Gets the text.
     */
    getText(): string;
    /**
     * Gets the kind.
     *
     * Examples: "text", "lineBreak"
     */
    getKind(): string;
}

/**
 * Represents a text change.
 */
export declare class TextChange {
    /** Gets the compiler text change. */
    readonly compilerObject: ts.TextChange;
    /**
     * Gets the text span.
     */
    getSpan(): TextSpan;
    /**
     * Gets the new text.
     */
    getNewText(): string;
}

/**
 * Represents a span of text.
 */
export declare class TextSpan {
    /** Gets the compiler text span. */
    readonly compilerObject: ts.TextSpan;
    /**
     * Gets the start.
     */
    getStart(): number;
    /**
     * Gets the start + length.
     */
    getEnd(): number;
    /**
     * Gets the length.
     */
    getLength(): number;
}

/**
 * Wrapper around the TypeChecker.
 */
export declare class TypeChecker {
    /**
     * Gets the compiler's TypeChecker.
     */
    readonly compilerObject: ts.TypeChecker;
    /**
     * Gets the apparent type of a type.
     * @param type - Type to get the apparent type of.
     */
    getApparentType(type: Type): Type<ts.Type>;
    /**
     * Gets the constant value of a declaration.
     * @param node - Node to get the constant value from.
     */
    getConstantValue(node: EnumMember): string | number | undefined;
    /**
     * Gets the fully qualified name of a symbol.
     * @param symbol - Symbol to get the fully qualified name of.
     */
    getFullyQualifiedName(symbol: Symbol): string;
    /**
     * Gets the type at the specified location.
     * @param node - Node to get the type for.
     */
    getTypeAtLocation(node: Node): Type;
    /**
     * Gets the contextual type of an expression.
     * @param expression - Expression.
     */
    getContextualType(expression: Expression): Type | undefined;
    /**
     * Gets the type of a symbol at the specified location.
     * @param symbol - Symbol to get the type for.
     * @param node - Location to get the type for.
     */
    getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type;
    /**
     * Gets the declared type of a symbol.
     * @param symbol - Symbol to get the type for.
     */
    getDeclaredTypeOfSymbol(symbol: Symbol): Type;
    /**
     * Gets the symbol at the specified location or undefined if none exists.
     * @param node - Node to get the symbol for.
     */
    getSymbolAtLocation(node: Node): Symbol | undefined;
    /**
     * Gets the aliased symbol of a symbol.
     * @param symbol - Symbol to get the alias symbol of.
     */
    getAliasedSymbol(symbol: Symbol): Symbol | undefined;
    /**
     * Gets the properties of a type.
     * @param type - Type.
     */
    getPropertiesOfType(type: Type): Symbol[];
    /**
     * Gets the type text
     * @param type - Type to get the text of.
     * @param enclosingNode - Enclosing node.
     * @param typeFormatFlags - Type format flags.
     */
    getTypeText(type: Type, enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags): string;
    /**
     * Gets the return type of a signature.
     * @param signature - Signature to get the return type of.
     */
    getReturnTypeOfSignature(signature: Signature): Type;
    /**
     * Gets a signature from a node.
     * @param node - Node to get the signature from.
     */
    getSignatureFromNode(node: Node<ts.SignatureDeclaration>): Signature | undefined;
    /**
     * Gets the exports of a module.
     * @param moduleSymbol - Module symbol.
     */
    getExportsOfModule(moduleSymbol: Symbol): Symbol[];
    /**
     * Gets the local target symbol of the provided export specifier.
     * @param exportSpecifier - Export specifier.
     */
    getExportSpecifierLocalTargetSymbol(exportSpecifier: ExportSpecifier): Symbol | undefined;
    /**
     * Gets the base type of a literal type.
     *
     * For example, for a number literal type it will return the number type.
     * @param type - Literal type to get the base type of.
     */
    getBaseTypeOfLiteralType(type: Type): Type<ts.Type>;
    private getDefaultTypeFormatFlags;
}

export declare class ArrayTypeNode extends TypeNode<ts.ArrayTypeNode> {
    /**
     * Gets the array type node's element type node.
     */
    getElementTypeNode(): TypeNode;
}

declare const ConstructorTypeNodeBase: Constructor<SignaturedDeclaration> & typeof TypeNode;

export declare class ConstructorTypeNode extends ConstructorTypeNodeBase<ts.ConstructorTypeNode> {
}

declare const ExpressionWithTypeArgumentsBase: Constructor<LeftHandSideExpressionedNode> & typeof TypeNode;

export declare class ExpressionWithTypeArguments extends ExpressionWithTypeArgumentsBase<ts.ExpressionWithTypeArguments> {
    /**
     * Gets the type arguments.
     */
    getTypeArguments(): TypeNode[];
}

declare const FunctionTypeNodeBase: Constructor<TypeParameteredNode> & Constructor<SignaturedDeclaration> & typeof TypeNode;

export declare class FunctionTypeNode extends FunctionTypeNodeBase<ts.FunctionTypeNode> {
}

declare const ImportTypeNodeBase: Constructor<TypeArgumentedNode> & typeof TypeNode;

export declare class ImportTypeNode extends ImportTypeNodeBase<ts.ImportTypeNode> {
    /**
     * Sets the argument text.
     * @param text - Text of the argument.
     */
    setArgument(text: string): this;
    /**
     * Gets the argument passed into the import type.
     */
    getArgument(): TypeNode;
    /**
     * Sets the qualifier text.
     * @param text - Text.
     */
    setQualifier(text: string): this;
    /**
     * Gets the qualifier of the import type if it exists or throws
     */
    getQualifierOrThrow(): EntityName;
    /**
     * Gets the qualifier of the import type if it exists or returns undefined.
     */
    getQualifier(): EntityName | undefined;
}

export declare class IntersectionTypeNode extends TypeNode<ts.IntersectionTypeNode> {
    /**
     * Gets the intersection type nodes.
     */
    getTypeNodes(): TypeNode[];
}

export declare class LiteralTypeNode extends TypeNode<ts.LiteralTypeNode> {
    /**
     * Gets the literal type node's literal.
     */
    getLiteral(): BooleanLiteral | LiteralExpression | PrefixUnaryExpression;
}

export declare class TupleTypeNode extends TypeNode<ts.TupleTypeNode> {
    /**
     * Gets the tuple element type nodes.
     */
    getElementTypeNodes(): TypeNode[];
}

export declare class Type<TType extends ts.Type = ts.Type> {
    /**
     * Gets the underlying compiler type.
     */
    readonly compilerType: TType;
    /**
     * Gets the type text.
     * @param enclosingNode - The enclosing node.
     * @param typeFormatFlags - Format flags for the type text.
     */
    getText(enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags): string;
    /**
     * Gets the alias symbol if it exists.
     */
    getAliasSymbol(): Symbol | undefined;
    /**
     * Gets the alias symbol if it exists, or throws.
     */
    getAliasSymbolOrThrow(): Symbol;
    /**
     * Gets the alias type arguments.
     */
    getAliasTypeArguments(): Type[];
    /**
     * Gets the apparent type.
     */
    getApparentType(): Type;
    /**
     * Gets the array type
     */
    getArrayType(): Type<ts.Type> | undefined;
    /**
     * Gets the base types.
     */
    getBaseTypes(): Type<ts.BaseType>[];
    /**
     * Gets the base type of a literal type.
     *
     * For example, for a number literal type it will return the number type.
     */
    getBaseTypeOfLiteralType(): Type<ts.Type>;
    /**
     * Gets the call signatures.
     */
    getCallSignatures(): Signature[];
    /**
     * Gets the construct signatures.
     */
    getConstructSignatures(): Signature[];
    /**
     * Gets the constraint or throws if it doesn't exist.
     */
    getConstraintOrThrow(): Type<ts.Type>;
    /**
     * Gets the constraint or returns undefined if it doesn't exist.
     */
    getConstraint(): Type<ts.Type> | undefined;
    /**
     * Gets the default type or throws if it doesn't exist.
     */
    getDefaultOrThrow(): Type<ts.Type>;
    /**
     * Gets the default type or returns undefined if it doesn't exist.
     */
    getDefault(): Type<ts.Type> | undefined;
    /**
     * Gets the properties of the type.
     */
    getProperties(): Symbol[];
    /**
     * Gets a property.
     * @param name - By a name.
     * @param findFunction - Function for searching for a property.
     */
    getProperty(name: string): Symbol | undefined;
    getProperty(findFunction: (declaration: Symbol) => boolean): Symbol | undefined;
    /**
     * Gets the apparent properties of the type.
     */
    getApparentProperties(): Symbol[];
    /**
     * Gets an apparent property.
     * @param name - By a name.
     * @param findFunction - Function for searching for an apparent property.
     */
    getApparentProperty(name: string): Symbol | undefined;
    getApparentProperty(findFunction: (declaration: Symbol) => boolean): Symbol | undefined;
    /**
     * Gets if the type is possibly null or undefined.
     */
    isNullable(): boolean;
    /**
     * Gets the non-nullable type.
     */
    getNonNullableType(): Type;
    /**
     * Gets the number index type.
     */
    getNumberIndexType(): Type | undefined;
    /**
     * Gets the string index type.
     */
    getStringIndexType(): Type | undefined;
    /**
     * Gets the target type of a type reference if it exists.
     */
    getTargetType(): Type<ts.GenericType> | undefined;
    /**
     * Gets the target type of a type reference or throws if it doesn't exist.
     */
    getTargetTypeOrThrow(): Type<ts.GenericType>;
    /**
     * Gets type arguments.
     */
    getTypeArguments(): Type[];
    /**
     * Gets the individual element types of the tuple.
     */
    getTupleElements(): Type[];
    /**
     * Gets the union types.
     */
    getUnionTypes(): Type[];
    /**
     * Gets the intersection types.
     */
    getIntersectionTypes(): Type[];
    /**
     * Gets the symbol of the type.
     */
    getSymbol(): Symbol | undefined;
    /**
     * Gets the symbol of the type or throws.
     */
    getSymbolOrThrow(): Symbol;
    /**
     * Gets if this is an anonymous type.
     */
    isAnonymous(): boolean;
    /**
     * Gets if this is an array type.
     */
    isArray(): boolean;
    /**
     * Gets if this is a boolean type.
     */
    isBoolean(): boolean;
    /**
     * Gets if this is a string type.
     */
    isString(): boolean;
    /**
     * Gets if this is a number type.
     */
    isNumber(): boolean;
    /**
     * Gets if this is a literal type.
     */
    isLiteral(): boolean;
    /**
     * Gets if this is a boolean literal type.
     */
    isBooleanLiteral(): boolean;
    /**
     * Gets if this is an enum literal type.
     */
    isEnumLiteral(): boolean;
    /**
     * Gets if this is a number literal type.
     */
    isNumberLiteral(): boolean;
    /**
     * Gets if this is a string literal type.
     */
    isStringLiteral(): boolean;
    /**
     * Gets if this is a class type.
     */
    isClass(): boolean;
    /**
     * Gets if this is a class or interface type.
     */
    isClassOrInterface(): boolean;
    /**
     * Gets if this is an enum type.
     */
    isEnum(): boolean;
    /**
     * Gets if this is an interface type.
     */
    isInterface(): boolean;
    /**
     * Gets if this is an object type.
     */
    isObject(): boolean;
    /**
     * Gets if this is a type parameter.
     */
    isTypeParameter(): this is TypeParameter;
    /**
     * Gets if this is a tuple type.
     */
    isTuple(): boolean;
    /**
     * Gets if this is a union type.
     */
    isUnion(): boolean;
    /**
     * Gets if this is an intersection type.
     */
    isIntersection(): boolean;
    /**
     * Gets if this is a union or intersection type.
     */
    isUnionOrIntersection(): boolean;
    /**
     * Gets if this is the null type.
     */
    isNull(): boolean;
    /**
     * Gets if this is the undefined type.
     */
    isUndefined(): boolean;
    /**
     * Gets the type flags.
     */
    getFlags(): TypeFlags;
    /**
     * Gets the object flags.
     * @remarks Returns 0 for a non-object type.
     */
    getObjectFlags(): ObjectFlags | 0;
    private _hasTypeFlag;
    private _hasAnyTypeFlag;
    private _hasObjectFlag;
}

declare const TypeAliasDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TypeParameteredNode> & Constructor<TypedNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Statement;

export declare class TypeAliasDeclaration extends TypeAliasDeclarationBase<ts.TypeAliasDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<TypeAliasDeclarationStructure>): this;
}

declare const TypeLiteralNodeBase: Constructor<TypeElementMemberedNode> & typeof TypeNode;

export declare class TypeLiteralNode extends TypeLiteralNodeBase<ts.TypeLiteralNode> {
}

export declare class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
}

export declare class TypeParameter extends Type<ts.TypeParameter> {
    /**
     * Gets the constraint or throws if it doesn't exist.
     */
    getConstraintOrThrow(): Type;
    /**
     * Gets the constraint type.
     */
    getConstraint(): Type | undefined;
    /**
     * Gets the default type or throws if it doesn't exist.
     */
    getDefaultOrThrow(): Type;
    /**
     * Gets the default type or undefined if it doesn't exist.
     */
    getDefault(): Type | undefined;
}

declare const TypeParameterDeclarationBase: Constructor<NamedNode> & typeof Node;

export declare class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
    /**
     * Gets the constraint node of the type parameter.
     * @deprecated - Use .getConstraint().
     */
    getConstraintNode(): TypeNode | undefined;
    /**
     * Gets the constraint of the type parameter.
     */
    getConstraint(): TypeNode | undefined;
    /**
     * Gets the constraint of the type parameter or throws if it doesn't exist.
     */
    getConstraintOrThrow(): TypeNode<ts.TypeNode>;
    /**
     * Sets the type parameter constraint.
     * @param text - Text to set as the constraint.
     */
    setConstraint(text: string): this;
    /**
     * Removes the constraint type node.
     */
    removeConstraint(): this;
    /**
     * Gets the default node of the type parameter.
     */
    getDefault(): TypeNode | undefined;
    /**
     * Gets the default node of the type parameter or throws if it doesn't exist.
     */
    getDefaultOrThrow(): TypeNode<ts.TypeNode>;
    /**
     * Gets the default node of the type parameter.
     * @deprecated Use .getDefault().
     */
    getDefaultNode(): TypeNode | undefined;
    /**
     * Sets the type parameter default type node.
     * @param text - Text to set as the default type node.
     */
    setDefault(text: string): this;
    /**
     * Removes the default type node.
     */
    removeDefault(): this;
    /**
     * Removes this type parameter.
     */
    remove(): void;
}

export declare class TypeReferenceNode extends TypeNode<ts.TypeReferenceNode> {
    /**
     * Gets the type name.
     */
    getTypeName(): EntityName;
    /**
     * Gets the type arguments.
     */
    getTypeArguments(): TypeNode[];
}

export declare class UnionTypeNode extends TypeNode<ts.UnionTypeNode> {
    /**
     * Gets the union type nodes.
     */
    getTypeNodes(): TypeNode[];
}

/**
 * Holds the compiler options.
 */
export declare class CompilerOptionsContainer extends SettingsContainer<CompilerOptions> {
    constructor();
}

/** Kinds of indentation */
export declare enum IndentationText {
    /** Two spaces */
    TwoSpaces = "  ",
    /** Four spaces */
    FourSpaces = "    ",
    /** Eight spaces */
    EightSpaces = "        ",
    /** Tab */
    Tab = "\t"
}

/**
 * Manipulation settings.
 */
export interface ManipulationSettings extends SupportedFormatCodeSettingsOnly {
    /** Indentation text */
    indentationText: IndentationText;
    /** New line kind */
    newLineKind: NewLineKind;
    /** Quote type used for string literals. */
    quoteKind: QuoteKind;
}

/**
 * FormatCodeSettings that are currently supported in the library.
 */
export interface SupportedFormatCodeSettings extends SupportedFormatCodeSettingsOnly, EditorSettings {
}

/**
 * FormatCodeSettings that are currently supported in the library.
 */
export interface SupportedFormatCodeSettingsOnly {
    /**
     * Whether to insert a space after opening and before closing non-empty braces.
     *
     * ex. `import { Item } from "./Item";` or `import {Item} from "./Item";`
     */
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: boolean;
}

/**
 * Holds the manipulation settings.
 */
export declare class ManipulationSettingsContainer extends SettingsContainer<ManipulationSettings> {
    private editorSettings;
    private formatCodeSettings;
    private userPreferences;
    constructor();
    /**
     * Gets the editor settings based on the current manipulation settings.
     */
    getEditorSettings(): Readonly<EditorSettings>;
    /**
     * Gets the format code settings.
     */
    getFormatCodeSettings(): Readonly<SupportedFormatCodeSettings>;
    /**
     * Gets the user preferences.
     */
    getUserPreferences(): Readonly<UserPreferences>;
    /**
     * Gets the quote kind used for string literals.
     */
    getQuoteKind(): QuoteKind;
    /**
     * Gets the new line kind.
     */
    getNewLineKind(): NewLineKind;
    /**
     * Gets the new line kind as a string.
     */
    getNewLineKindAsString(): "\n" | "\r\n";
    /**
     * Gets the indentation text;
     */
    getIndentationText(): IndentationText;
    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<ManipulationSettings>): void;
}
export declare abstract class SettingsContainer<T extends object> {
    private readonly defaultSettings;
    protected settings: T;
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
}
export interface AbstractableNodeStructure {
    isAbstract?: boolean;
}
export interface AmbientableNodeStructure {
    hasDeclareKeyword?: boolean;
}
export interface AsyncableNodeStructure {
    isAsync?: boolean;
}
export interface AwaitableNodeStructure {
    isAwaited?: boolean;
}

export interface BodiedNodeStructure {
    bodyText?: string | WriterFunction;
}

export interface BodyableNodeStructure {
    bodyText?: string | WriterFunction;
}

export interface DecoratableNodeStructure {
    decorators?: DecoratorStructure[];
}
export interface ExclamationTokenableNodeStructure {
    hasExclamationToken?: boolean;
}
export interface ExportableNodeStructure {
    isExported?: boolean;
    isDefaultExport?: boolean;
}
export interface ExtendsClauseableNodeStructure {
    extends?: string[];
}
export interface GeneratorableNodeStructure {
    isGenerator?: boolean;
}
export interface ImplementsClauseableNodeStructure {
    implements?: string[];
}

export interface InitializerExpressionableNodeStructure extends InitializerSetExpressionableNodeStructure {
}

export interface InitializerSetExpressionableNodeStructure {
    initializer?: string | WriterFunction;
}

export interface JSDocableNodeStructure {
    docs?: (JSDocStructure | string)[];
}
export interface BindingNamedNodeStructure {
    name: string;
}
export interface DeclarationNamedNodeStructure {
    name: string;
}
export interface NameableNodeStructure {
    name?: string;
}
export interface NamedNodeStructure {
    name: string;
}
export interface PropertyNameableNodeStructure {
    name?: string;
}
export interface PropertyNamedNodeStructure {
    name: string;
}

export interface ParameteredNodeStructure {
    parameters?: ParameterDeclarationStructure[];
}
export interface QuestionTokenableNodeStructure {
    hasQuestionToken?: boolean;
}
export interface ReadonlyableNodeStructure {
    isReadonly?: boolean;
}

export interface ReturnTypedNodeStructure {
    returnType?: string | WriterFunction;
}

export interface ScopeableNodeStructure {
    scope?: Scope;
}

export interface ScopedNodeStructure {
    scope?: Scope;
}

export interface SignaturedDeclarationStructure extends ParameteredNodeStructure, ReturnTypedNodeStructure {
}
export interface StaticableNodeStructure {
    isStatic?: boolean;
}

export interface TypedNodeStructure {
    type?: string | WriterFunction;
}

export interface TypeElementMemberedNodeStructure {
    callSignatures?: CallSignatureDeclarationStructure[];
    constructSignatures?: ConstructSignatureDeclarationStructure[];
    indexSignatures?: IndexSignatureDeclarationStructure[];
    methods?: MethodSignatureStructure[];
    properties?: PropertySignatureStructure[];
}

export interface TypeParameteredNodeStructure {
    typeParameters?: TypeParameterDeclarationStructure[];
}

export interface ClassDeclarationStructure extends NameableNodeStructure, ClassDeclarationSpecificStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, AbstractableNodeStructure, ExportableNodeStructure {
    /**
     * The class name.
     * @remarks Can be undefined. For example: `export default class { ... }`
     */
    name?: string;
}

export interface ClassDeclarationSpecificStructure {
    extends?: string;
    ctors?: ConstructorDeclarationStructure[];
    properties?: PropertyDeclarationStructure[];
    getAccessors?: GetAccessorDeclarationStructure[];
    setAccessors?: SetAccessorDeclarationStructure[];
    methods?: MethodDeclarationStructure[];
}

export interface ConstructorDeclarationStructure extends ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure {
}

export interface ConstructorDeclarationSpecificStructure {
    overloads?: ConstructorDeclarationOverloadStructure[];
}

export interface ConstructorDeclarationOverloadStructure extends ScopedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure {
}

export interface GetAccessorDeclarationStructure extends GetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodiedNodeStructure {
}

export interface GetAccessorDeclarationSpecificStructure {
}

export interface MethodDeclarationStructure extends MethodDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure {
}

export interface MethodDeclarationSpecificStructure {
    overloads?: MethodDeclarationOverloadStructure[];
}

export interface MethodDeclarationOverloadStructure extends StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure {
}

export interface PropertyDeclarationStructure extends PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, ExclamationTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure {
}

export interface SetAccessorDeclarationStructure extends SetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodiedNodeStructure {
}

export interface SetAccessorDeclarationSpecificStructure {
}

export declare type ObjectLiteralElementLikeStructures = PropertyAssignmentStructure | ShorthandPropertyAssignmentStructure | SpreadAssignmentStructure | MethodDeclarationStructure | GetAccessorDeclarationStructure | SetAccessorDeclarationStructure;

export interface ObjectLiteralExpressionStructure {
    properties: ObjectLiteralElementLikeStructures[];
}

export interface PropertyAssignmentStructure extends PropertyNamedNodeStructure {
    initializer: string | WriterFunction;
}

export interface ShorthandPropertyAssignmentStructure extends NamedNodeStructure {
}

export interface SpreadAssignmentStructure {
    expression: string | WriterFunction;
}

export interface DecoratorStructure {
    name: string;
    arguments?: (string | WriterFunction)[];
}

export interface JSDocStructure {
    description: string | WriterFunction;
}

export interface EnumDeclarationStructure extends NamedNodeStructure, EnumDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
}

export interface EnumDeclarationSpecificStructure {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}

export interface EnumMemberStructure extends EnumMemberSpecificStructure, PropertyNamedNodeStructure, JSDocableNodeStructure, InitializerExpressionableNodeStructure {
}

export interface EnumMemberSpecificStructure {
    value?: number | string;
}

export interface ExportAssignmentStructure {
    isExportEquals?: boolean;
    expression: string | WriterFunction;
}

export interface ExportDeclarationStructure {
    namedExports?: (string | ExportSpecifierStructure)[];
    moduleSpecifier?: string;
}
export interface ExportSpecifierStructure {
    name: string;
    alias?: string;
}

export interface ImportDeclarationStructure {
    defaultImport?: string;
    namespaceImport?: string;
    namedImports?: (ImportSpecifierStructure | string)[];
    moduleSpecifier: string;
}
export interface ImportSpecifierStructure {
    name: string;
    alias?: string;
}

export interface SourceFileStructure extends SourceFileSpecificStructure, StatementedNodeStructure {
    bodyText?: string | WriterFunction;
}

export interface SourceFileSpecificStructure {
    imports?: ImportDeclarationStructure[];
    exports?: ExportDeclarationStructure[];
}

export interface FunctionDeclarationStructure extends FunctionDeclarationSpecificStructure, NamedNodeStructure, FunctionLikeDeclarationStructure, StatementedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, BodyableNodeStructure {
}

export interface FunctionDeclarationSpecificStructure {
    overloads?: FunctionDeclarationOverloadStructure[];
}

export interface FunctionDeclarationOverloadStructure extends SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
}

export interface FunctionLikeDeclarationStructure extends SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, StatementedNodeStructure {
}

export interface ParameterDeclarationStructure extends DeclarationNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure, ScopeableNodeStructure, InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure {
}

export interface ParameterDeclarationSpecificStructure {
    isRestParameter?: boolean;
}

export interface CallSignatureDeclarationStructure extends JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}

export interface ConstructSignatureDeclarationStructure extends JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}

export interface IndexSignatureDeclarationStructure extends JSDocableNodeStructure, ReadonlyableNodeStructure {
    keyName?: string;
    keyType?: string;
    returnType: string | WriterFunction;
}

export interface InterfaceDeclarationStructure extends NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, TypeElementMemberedNodeStructure {
}

export interface InterfaceDeclarationSpecificStructure {
}

export interface MethodSignatureStructure extends PropertyNamedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}

export interface PropertySignatureStructure extends PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure {
}

export interface JsxAttributeStructure extends NamedNodeStructure {
    isSpreadAttribute?: boolean;
    initializer?: string;
}

export interface JsxElementStructure {
    name: string;
    attributes?: JsxAttributeStructure[];
    isSelfClosing?: boolean;
    children?: JsxElementStructure[];
}

export interface NamespaceDeclarationStructure extends NamedNodeStructure, NamespaceDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, StatementedNodeStructure, BodiedNodeStructure {
}

export interface NamespaceDeclarationSpecificStructure {
    /**
     * If the namespace has the module keyword.
     */
    hasModuleKeyword?: boolean;
}

export interface StatementedNodeStructure {
    classes?: ClassDeclarationStructure[];
    enums?: EnumDeclarationStructure[];
    functions?: FunctionDeclarationStructure[];
    interfaces?: InterfaceDeclarationStructure[];
    namespaces?: NamespaceDeclarationStructure[];
    typeAliases?: TypeAliasDeclarationStructure[];
}

export interface VariableDeclarationListStructure extends VariableDeclarationListSpecificStructure {
}

export interface VariableDeclarationListSpecificStructure {
    declarationKind?: VariableDeclarationKind;
    declarations: VariableDeclarationStructure[];
}

export interface VariableDeclarationStructure extends BindingNamedNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure, ExclamationTokenableNodeStructure {
}

export interface VariableStatementStructure extends VariableStatementSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
}

export interface VariableStatementSpecificStructure {
    declarationKind?: VariableDeclarationKind;
    declarations: VariableDeclarationStructure[];
}

export interface TypeAliasDeclarationStructure extends NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
    type: string | WriterFunction;
}

export interface TypeParameterDeclarationStructure extends NamedNodeStructure {
    constraint?: string;
    default?: string;
}

export * from "./typescript/typescript";
export * from "./codeBlockWriter/code-block-writer";
