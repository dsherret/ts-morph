import { ProjectContext } from "../../ProjectContext";
import { ModuleResolutionKind, ts } from "../../typescript";
import * as tsInternal from "../../typescript/tsInternal";
import { SourceFile } from "../file";
import { Diagnostic, DiagnosticWithLocation, EmitResult, MemoryEmitResult, MemoryEmitResultFile } from "./results";
import { TypeChecker } from "./TypeChecker";

/**
 * Options for emitting from a Program.
 */
export interface ProgramEmitOptions extends EmitOptions {
    writeFile?: ts.WriteFileCallback;
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
    /**
     * Transformers to act on the files when emitting.
     */
    customTransformers?: ts.CustomTransformers;
}

/**
 * Wrapper around Program.
 */
export class Program {
    /** @internal */
    private readonly context: ProjectContext;
    /** @internal */
    private readonly typeChecker: TypeChecker;
    /** @internal */
    private _createdCompilerObject: ts.Program | undefined;
    /** @internal */
    private _getOrCreateCompilerObject!: () => ts.Program;

    /** @internal */
    constructor(context: ProjectContext, rootNames: ReadonlyArray<string>, host: ts.CompilerHost) {
        this.context = context;
        this.typeChecker = new TypeChecker(this.context);
        this.reset(rootNames, host);
    }

    /**
     * Gets the underlying compiler program.
     */
    get compilerObject() {
        return this._getOrCreateCompilerObject();
    }

    /**
     * Resets the program.
     * @internal
     */
    reset(rootNames: ReadonlyArray<string>, host: ts.CompilerHost) {
        const compilerOptions = this.context.compilerOptions.get();
        this._getOrCreateCompilerObject = () => {
            // need to use ts.createProgram instead of languageService.getProgram() because the
            // program created by the language service is not fully featured (ex. does not write to the file system)
            if (this._createdCompilerObject == null)
                this._createdCompilerObject = ts.createProgram(rootNames, compilerOptions, host);

            // this needs to be on a separate line in case the program was reset between the line above and here
            return this._createdCompilerObject || this._getOrCreateCompilerObject();
        };
        this._createdCompilerObject = undefined;
        this.typeChecker.reset(() => this.compilerObject.getTypeChecker());
    }

    /**
     * Get the program's type checker.
     */
    getTypeChecker() {
        return this.typeChecker;
    }

    /**
     * Emits the TypeScript files to JavaScript files.
     * @param options - Options for emitting.
     */
    emit(options: ProgramEmitOptions = {}) {
        return new EmitResult(this.context, this._emit(options));
    }

    /**
     * Emits the TypeScript files to JavaScript files to memory.
     * @param options - Options for emitting.
     */
    emitToMemory(options: EmitOptions = {}) {
        const sourceFiles: MemoryEmitResultFile[] = [];
        const { fileSystemWrapper } = this.context;
        const emitResult = this._emit({
            writeFile: (filePath, text, writeByteOrderMark) => {
                sourceFiles.push({
                    filePath: fileSystemWrapper.getStandardizedAbsolutePath(filePath),
                    text,
                    writeByteOrderMark: writeByteOrderMark || false
                });
            }, ...options
        });
        return new MemoryEmitResult(this.context, emitResult, sourceFiles);
    }

    /** @internal */
    private _emit(options: ProgramEmitOptions = {}) {
        const targetSourceFile = options.targetSourceFile != null ? options.targetSourceFile.compilerNode : undefined;
        const { emitOnlyDtsFiles, customTransformers, writeFile } = options;
        const cancellationToken = undefined; // todo: expose this
        return this.compilerObject.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    }

    /**
     * Gets the syntactic diagnostics.
     * @param sourceFile - Optional source file to filter by.
     */
    getSyntacticDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[] {
        const compilerDiagnostics = this.compilerObject.getSyntacticDiagnostics(sourceFile == null ? undefined : sourceFile.compilerNode);
        return compilerDiagnostics.map(d => this.context.compilerFactory.getDiagnosticWithLocation(d));
    }

    /**
     * Gets the semantic diagnostics.
     * @param sourceFile - Optional source file to filter by.
     */
    getSemanticDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
        const compilerDiagnostics = this.compilerObject.getSemanticDiagnostics(sourceFile == null ? undefined : sourceFile.compilerNode);
        return compilerDiagnostics.map(d => this.context.compilerFactory.getDiagnostic(d));
    }

    /**
     * Gets the declaration diagnostics.
     * @param sourceFile - Optional source file to filter by.
     */
    getDeclarationDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[] {
        const compilerDiagnostics = this.compilerObject.getDeclarationDiagnostics(sourceFile == null ? undefined : sourceFile.compilerNode);
        return compilerDiagnostics.map(d => this.context.compilerFactory.getDiagnosticWithLocation(d));
    }

    /**
     * Gets the global diagnostics.
     */
    getGlobalDiagnostics(): Diagnostic[] {
        const compilerDiagnostics = this.compilerObject.getGlobalDiagnostics();
        return compilerDiagnostics.map(d => this.context.compilerFactory.getDiagnostic(d));
    }

    /**
     * Gets the emit module resolution kind.
     */
    getEmitModuleResolutionKind(): ModuleResolutionKind {
        return tsInternal.getEmitModuleResolutionKind(this.compilerObject.getCompilerOptions());
    }

    /**
     * Gets if the provided source file is from an external library.
     * @param sourceFile - Source file.
     */
    isSourceFileFromExternalLibrary(sourceFile: SourceFile) {
        return this.compilerObject.isSourceFileFromExternalLibrary(sourceFile.compilerNode);
    }
}
