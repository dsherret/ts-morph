import * as ts from "typescript";
import * as errors from "./errors";
import * as compiler from "./compiler";
import * as factories from "./factories";
import {SourceFileStructure} from "./structures";
import {CompilerOptionsResolver, FileUtils} from "./utils";
import {FileSystemHost} from "./FileSystemHost";
import {DefaultFileSystemHost} from "./DefaultFileSystemHost";
import {fillSourceFileFromStructure} from "./manipulation/fillClassFunctions";
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
        if (options.tsConfigFilePath != null && options.compilerOptions != null)
            throw new errors.InvalidOperationError(`Cannot set both ${nameof(options.tsConfigFilePath)} and ${nameof(options.compilerOptions)}.`);

        const compilerOptionsResolver = new CompilerOptionsResolver(fileSystem, options);
        this.global = new GlobalContainer(fileSystem, compilerOptionsResolver.getCompilerOptions(), true);
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
                this.getOrAddSourceFileFromFilePath(filePath);
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
    getOrAddSourceFileFromFilePath(filePath: string): compiler.SourceFile {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        if (!this.fileSystem.fileExists(absoluteFilePath))
            throw new errors.FileNotFoundError(absoluteFilePath);
        return this.global.compilerFactory.getSourceFileFromFilePath(absoluteFilePath);
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
        fillSourceFileFromStructure(sourceFile, structure);
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
     * Gets a source file by a file name, file path, or search function. Returns undefined if none exists.
     * @param fileName - File name or path that the path could end with or equal.
     * @param searchFunction - Search function.
     */
    getSourceFile(fileNameOrPath: string): compiler.SourceFile | undefined;
    getSourceFile(searchFunction: (file: compiler.SourceFile) => boolean): compiler.SourceFile | undefined;
    getSourceFile(fileNameOrSearchFunction: string | ((file: compiler.SourceFile) => boolean)): compiler.SourceFile | undefined {
        let searchFunction = fileNameOrSearchFunction as ((file: compiler.SourceFile) => boolean);

        if (typeof fileNameOrSearchFunction === "string")
            searchFunction = def => FileUtils.filePathMatches(def.getFilePath(), fileNameOrSearchFunction);

        return this.getSourceFiles().find(searchFunction);
    }

    /**
     * Gets all the source files contained in the compiler wrapper.
     */
    getSourceFiles(): compiler.SourceFile[] {
        return this.global.languageService.getSourceFiles();
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
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.global.program.compilerProgram);
        return compilerDiagnostics.map(d => this.global.compilerFactory.getDiagnostic(d));
    }

    /**
     * Gets a language service.
     */
    getLanguageService(): compiler.LanguageService {
        return this.global.languageService;
    }

    /**
     * Emits all the source files.
     * @param emitOptions - Optional emit options.
     */
    emit(emitOptions: compiler.EmitOptions = {}): compiler.EmitResult {
        return this.global.program.emit(emitOptions);
    }
}
