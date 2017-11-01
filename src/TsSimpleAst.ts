import * as ts from "typescript";
import {Minimatch} from "minimatch";
import * as errors from "./errors";
import * as compiler from "./compiler";
import * as factories from "./factories";
import {SourceFileStructure} from "./structures";
import {getCompilerOptionsFromTsConfig, FileUtils, ArrayUtils} from "./utils";
import {FileSystemHost} from "./FileSystemHost";
import {DefaultFileSystemHost} from "./DefaultFileSystemHost";
import {ManipulationSettings, ManipulationSettingsContainer} from "./ManipulationSettings";
import {GlobalContainer} from "./GlobalContainer";

export interface Options {
    /** Compiler options */
    compilerOptions?: ts.CompilerOptions;
    /** File path to the tsconfig.json file */
    tsConfigFilePath?: string;
    /** Manipulation settings */
    manipulationSettings?: Partial<ManipulationSettings>;
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
    constructor(options: Options = {}, private fileSystem: FileSystemHost = new DefaultFileSystemHost()) {
        this.global = new GlobalContainer(fileSystem, getCompilerOptionsFromOptions(options, fileSystem), true);
        if (options.manipulationSettings != null)
            this.global.manipulationSettings.set(options.manipulationSettings);
    }

    /** Gets the manipulation settings. */
    get manipulationSettings(): ManipulationSettingsContainer {
        return this.global.manipulationSettings;
    }

    /**
     * Add source files based on file globs.
     * @param fileGlobs - File globs to add files based on.
     */
    addSourceFiles(...fileGlobs: string[]) {
        const filePaths = this.fileSystem.glob(fileGlobs);

        for (const filePath of filePaths) {
            // ignore any FileNotFoundErrors
            try {
                this.getOrAddSourceFile(filePath);
            } catch (ex) {
                /* istanbul ignore if */
                if (!(ex instanceof errors.FileNotFoundError))
                    throw ex;
            }
        }
    }

    /**
     * Gets or adds a source file from a file path.
     * @param filePath - File path to create the file from.
     */
    getOrAddSourceFile(filePath: string): compiler.SourceFile {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        if (!this.fileSystem.fileExistsSync(absoluteFilePath))
            throw new errors.FileNotFoundError(absoluteFilePath);
        return this.global.compilerFactory.getSourceFileFromFilePath(absoluteFilePath)!;
    }

    /**
     * Adds a source file from text.
     * @param filePath - File path for the source file.
     * @param sourceFileText - Source file text.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    addSourceFileFromText(filePath: string, sourceFileText: string): compiler.SourceFile {
        return this.global.compilerFactory.addSourceFileFromText(filePath, sourceFileText);
    }

    /**
     * Adds a source file from a structure.
     * @param filePath - File path for the source file.
     * @param structure - Structure that represents the source file.
     * @throws - InvalidOperationError if a source file already exists at the provided file path.
     */
    addSourceFileFromStructure(filePath: string, structure: SourceFileStructure): compiler.SourceFile {
        const sourceFile = this.global.compilerFactory.addSourceFileFromText(filePath, "");
        sourceFile.fill(structure);
        return sourceFile;
    }

    /**
     * Removes a source file from the AST.
     * @param sourceFile - Source file to remove.
     * @returns True if removed.
     */
    removeSourceFile(sourceFile: compiler.SourceFile) {
        return this.global.languageService.removeSourceFile(sourceFile);
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

        return ArrayUtils.find(this.getSourceFiles(), searchFunction);
    }

    /**
     * Gets all the source files contained in the compiler wrapper.
     * @param globPattern - Glob pattern for filtering out the source files.
     */
    getSourceFiles(globPattern?: string): compiler.SourceFile[] {
        let sourceFiles = this.global.languageService.getSourceFiles();
        if (typeof globPattern === "string") {
            const mm = new Minimatch(globPattern, { matchBase: true });
            sourceFiles = sourceFiles.filter(s => mm.match(s.getFilePath()));
        }
        return sourceFiles;
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
        return this.getSourceFiles().filter(f => !f.isSaved());
    }

    /**
     * Gets the compiler diagnostics.
     */
    getDiagnostics(): compiler.Diagnostic[] {
        // todo: implement cancellation token
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.global.program.compilerObject);
        return compilerDiagnostics.map(d => this.global.compilerFactory.getDiagnostic(d));
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
}

function getCompilerOptionsFromOptions(options: Options, fileSystem: FileSystemHost) {
    return {
        ...(options.tsConfigFilePath == null ? {} : getCompilerOptionsFromTsConfig(options.tsConfigFilePath, fileSystem)),
        ...(options.compilerOptions || {}) as ts.CompilerOptions
    };
}
