import * as ts from "typescript";
import {Minimatch} from "minimatch";
import * as errors from "./errors";
import * as compiler from "./compiler";
import * as factories from "./factories";
import {SourceFileStructure} from "./structures";
import {getCompilerOptionsFromTsConfig, FileUtils, ArrayUtils} from "./utils";
import {DefaultFileSystemHost, VirtualFileSystemHost, FileSystemHost, Directory} from "./fileSystem";
import {ManipulationSettings, ManipulationSettingsContainer} from "./ManipulationSettings";
import {GlobalContainer} from "./GlobalContainer";

export interface Options {
    /** Compiler options */
    compilerOptions?: ts.CompilerOptions;
    /** File path to the tsconfig.json file */
    tsConfigFilePath?: string;
    /** Manipulation settings */
    manipulationSettings?: Partial<ManipulationSettings>;
    /** Whether to use a virtual file system. */
    useVirtualFileSystem?: boolean;
}

/**
 * Compiler wrapper.
 */
export class TsSimpleAst {
    /** @internal */
    private readonly global: GlobalContainer;

    /**
     * Initializes a new instance.
     * @param options - Optional options.
     * @param fileSystem - Optional file system host. Useful for mocking access to the file system.
     */
    constructor(options: Options = {}, fileSystem?: FileSystemHost) {
        if (fileSystem != null && options.useVirtualFileSystem)
            throw new errors.InvalidOperationError("Cannot provide a file system when specifying to use a virtual file system.");
        else if (options.useVirtualFileSystem)
            fileSystem = new VirtualFileSystemHost();
        else if (fileSystem == null)
            fileSystem = new DefaultFileSystemHost();

        this.global = new GlobalContainer(fileSystem, getCompilerOptionsFromOptions(options, fileSystem), { createLanguageService: true });
        if (options.manipulationSettings != null)
            this.global.manipulationSettings.set(options.manipulationSettings);
    }

    /** Gets the manipulation settings. */
    get manipulationSettings(): ManipulationSettingsContainer {
        return this.global.manipulationSettings;
    }

    /**
     * Adds an existing directory from the path.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Path to add the directory at.
     */
    addExistingDirectory(dirPath: string): Directory {
        dirPath = FileUtils.getStandardizedAbsolutePath(this.global.fileSystem, dirPath);
        if (!this.global.fileSystem.directoryExistsSync(dirPath))
            throw new errors.DirectoryNotFoundError(dirPath);
        return this.global.compilerFactory.addDirectoryIfNotExists(dirPath);
    }

    /**
     * Creates a directory at the specified path.
     * Note: Will not save the directory to disk until one of its source files is saved.
     * @param dirPath - Path to create the directory at.
     * @throws - InvalidOperationError if a directory already exists at the provided file path.
     */
    createDirectory(dirPath: string): Directory {
        dirPath = FileUtils.getStandardizedAbsolutePath(this.global.fileSystem, dirPath);
        return this.global.compilerFactory.createDirectory(dirPath);
    }

    /**
     * Gets a directory by the specified path or throws it doesn't exist.
     * @param dirPath - Path to create the directory at.
     */
    getDirectoryOrThrow(dirPath: string): Directory {
        return errors.throwIfNullOrUndefined(this.getDirectory(dirPath),
            () => `Could not find a directory at the specified path: ${FileUtils.getStandardizedAbsolutePath(this.global.fileSystem, dirPath)}`);
    }

    /**
     * Gets a directory by the specified path or returns undefined if it doesn't exist.
     * @param dirPath - Directory path.
     */
    getDirectory(dirPath: string): Directory | undefined {
        dirPath = FileUtils.getStandardizedAbsolutePath(this.global.fileSystem, dirPath);
        return this.global.compilerFactory.getDirectory(dirPath);
    }

    /**
     * Gets all the directories.
     */
    getDirectories() {
        return ArrayUtils.from(this.global.compilerFactory.getDirectoriesByDepth());
    }

    /**
     * Gets the directories without a parent.
     */
    getRootDirectories() {
        return this.global.compilerFactory.getOrphanDirectories();
    }

    /**
     * Add source files based on file globs.
     * @param fileGlobs - File globs to add files based on.
     * @returns The matched source files.
     */
    addExistingSourceFiles(...fileGlobs: string[]): compiler.SourceFile[] {
        const sourceFiles: compiler.SourceFile[] = [];

        for (const filePath of this.global.fileSystem.glob(fileGlobs)) {
            // ignore any FileNotFoundErrors
            try {
                sourceFiles.push(this.addExistingSourceFile(filePath));
            } catch (ex) {
                /* istanbul ignore if */
                if (!(ex instanceof errors.FileNotFoundError))
                    throw ex;
            }
        }

        return sourceFiles;
    }

    /**
     * Adds an existing source file from a file path.
     *
     * Will return the source file if it was already added.
     * @param filePath - File path to get the file from.
     */
    addExistingSourceFile(filePath: string): compiler.SourceFile {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(this.global.fileSystem, filePath);
        if (!this.global.fileSystem.fileExistsSync(absoluteFilePath))
            throw new errors.FileNotFoundError(absoluteFilePath);
        return this.global.compilerFactory.getSourceFileFromFilePath(absoluteFilePath)!;
    }

    /**
     * Creates a source file at the specified file path.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string): compiler.SourceFile;
    /**
     * Creates a source file at the specified file path with the specified text.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @param sourceFileText - Text of the source file.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string, sourceFileText: string): compiler.SourceFile;
    /**
     * Creates a source file at the specified file path with the specified text.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param filePath - File path of the source file.
     * @param structure - Structure that represents the source file.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    createSourceFile(filePath: string, structure: SourceFileStructure): compiler.SourceFile;
    createSourceFile(filePath: string, structureOrText?: SourceFileStructure | string): compiler.SourceFile {
        return this.global.compilerFactory.createSourceFile(filePath, structureOrText);
    }

    /**
     * Removes a source file from the AST.
     * @param sourceFile - Source file to remove.
     * @returns True if removed.
     */
    removeSourceFile(sourceFile: compiler.SourceFile) {
        const previouslyForgotten = sourceFile.wasForgotten();
        sourceFile.forget();
        return !previouslyForgotten;
    }

    /**
     * Gets a source file by a file name or file path. Throws an error if it doesn't exist.
     * @param fileNameOrPath - File name or path that the path could end with or equal.
     */
    getSourceFileOrThrow(fileNameOrPath: string): compiler.SourceFile;
    /**
     * Gets a source file by a search function. Throws an erorr if it doesn't exist.
     * @param searchFunction - Search function.
     */
    getSourceFileOrThrow(searchFunction: (file: compiler.SourceFile) => boolean): compiler.SourceFile;
    getSourceFileOrThrow(fileNameOrSearchFunction: string | ((file: compiler.SourceFile) => boolean)): compiler.SourceFile {
        const sourceFile = this.getSourceFile(fileNameOrSearchFunction);
        if (sourceFile == null) {
            if (typeof fileNameOrSearchFunction === "string")
                throw new errors.InvalidOperationError(`Could not find source file based on the provided name or path: ${fileNameOrSearchFunction}.`);
            else
                throw new errors.InvalidOperationError(`Could not find source file based on the provided condition.`);
        }
        return sourceFile;
    }

    /**
     * Gets a source file by a file name or file path. Returns undefined if none exists.
     * @param fileNameOrPath - File name or path that the path could end with or equal.
     */
    getSourceFile(fileNameOrPath: string): compiler.SourceFile | undefined;
    /**
     * Gets a source file by a search function. Returns undefined if none exists.
     * @param searchFunction - Search function.
     */
    getSourceFile(searchFunction: (file: compiler.SourceFile) => boolean): compiler.SourceFile | undefined;
    /**
     * @internal
     */
    getSourceFile(fileNameOrSearchFunction: string | ((file: compiler.SourceFile) => boolean)): compiler.SourceFile | undefined;
    getSourceFile(fileNameOrSearchFunction: string | ((file: compiler.SourceFile) => boolean)): compiler.SourceFile | undefined {
        let searchFunction = fileNameOrSearchFunction as ((file: compiler.SourceFile) => boolean);

        if (typeof fileNameOrSearchFunction === "string")
            searchFunction = def => FileUtils.filePathMatches(def.getFilePath(), fileNameOrSearchFunction);

        return ArrayUtils.find(this.global.compilerFactory.getSourceFilesByDirectoryDepth(), searchFunction);
    }

    /**
     * Gets all the source files contained in the compiler wrapper.
     * @param globPattern - Glob pattern for filtering out the source files.
     */
    getSourceFiles(globPattern?: string): compiler.SourceFile[] {
        const sourceFiles = this.global.compilerFactory.getSourceFilesByDirectoryDepth();
        if (typeof globPattern === "string")
            return ArrayUtils.from(getFilteredSourceFiles());
        else
            return ArrayUtils.from(sourceFiles);

        function* getFilteredSourceFiles() {
            const mm = new Minimatch(globPattern!, { matchBase: true });
            for (const sourceFile of sourceFiles) {
                if (mm.match(sourceFile.getFilePath()))
                    yield sourceFile;
            }
        }
    }

    /**
     * Saves all the unsaved source files.
     */
    saveUnsavedSourceFiles() {
        return Promise.all(this.getUnsavedSourceFiles().map(f => f.save()));
    }

    /**
     * Saves all the unsaved source files synchronously.
     *
     * Remarks: This might be very slow compared to the asynchronous version if there are a lot of files.
     */
    saveUnsavedSourceFilesSync() {
        // sidenote: I wish I could do something like in c# where I do this all asynchronously then
        // wait synchronously on the task. It would not be as bad as this is performance wise. Maybe there
        // is a way, but people just shouldn't be using this method unless they're really lazy.
        for (const file of this.getUnsavedSourceFiles())
            file.saveSync();
    }

    private getUnsavedSourceFiles() {
        return ArrayUtils.from(getUnsavedIterator(this.global.compilerFactory.getSourceFilesByDirectoryDepth()));

        function *getUnsavedIterator(sourceFiles: IterableIterator<compiler.SourceFile>) {
            for (const sourceFile of sourceFiles) {
                if (!sourceFile.isSaved())
                    yield sourceFile;
            }
        }
    }

    /**
     * Gets the compiler diagnostics.
     */
    getDiagnostics(): compiler.Diagnostic[] {
        return [
            ...this.global.program.getSyntacticDiagnostics(),
            ...this.global.program.getSemanticDiagnostics(),
            ...this.global.program.getDeclarationDiagnostics()
        ];
    }

    /**
     * Gets the pre-emit diagnostics.
     */
    getPreEmitDiagnostics(): compiler.Diagnostic[] {
        return this.global.program.getPreEmitDiagnostics();
    }

    /**
     * Gets the language service.
     */
    getLanguageService(): compiler.LanguageService {
        return this.global.languageService;
    }

    /**
     * Gets the program.
     */
    getProgram(): compiler.Program {
        return this.global.program;
    }

    /**
     * Gets the type checker.
     */
    getTypeChecker(): compiler.TypeChecker {
        return this.global.typeChecker;
    }

    /**
     * Gets the file system.
     */
    getFileSystem(): FileSystemHost {
        return this.global.fileSystem;
    }

    /**
     * Emits all the source files.
     * @param emitOptions - Optional emit options.
     */
    emit(emitOptions: compiler.EmitOptions = {}): compiler.EmitResult {
        return this.global.program.emit(emitOptions);
    }

    /**
     * Gets the compiler options.
     */
    getCompilerOptions() {
        // return a copy
        return {...this.global.compilerOptions};
    }

    /**
     * Forgets the nodes created in the scope of the passed in block.
     *
     * This is an advanced method that can be used to easily "forget" all the nodes created within the scope of the block.
     * @param block - Block of code to run.
     */
    forgetNodesCreatedInBlock(block: (remember: (...node: compiler.Node[]) => void) => void): void;
    /**
     * Forgets the nodes created in the scope of the passed in block asynchronously.
     *
     * This is an advanced method that can be used to easily "forget" all the nodes created within the scope of the block.
     * @param block - Block of code to run.
     */
    forgetNodesCreatedInBlock(block: (remember: (...node: compiler.Node[]) => void) => Promise<void>): void;
    forgetNodesCreatedInBlock(block: (remember: (...node: compiler.Node[]) => void) => (void | Promise<void>)) {
        return this.global.compilerFactory.forgetNodesCreatedInBlock(block);
    }
}

function getCompilerOptionsFromOptions(options: Options, fileSystem: FileSystemHost) {
    return {
        ...(options.tsConfigFilePath == null ? {} : getCompilerOptionsFromTsConfig(options.tsConfigFilePath, fileSystem)),
        ...(options.compilerOptions || {}) as ts.CompilerOptions
    };
}
