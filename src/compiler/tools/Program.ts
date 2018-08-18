import { ProjectContext } from "../../ProjectContext";
import { ModuleResolutionKind, ts } from "../../typescript";
import * as tsInternal from "../../typescript/tsInternal";
import { SourceFile } from "../file";
import { Diagnostic, DiagnosticWithLocation, EmitResult } from "./results";
import { TypeChecker } from "./TypeChecker";

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
    constructor(context: ProjectContext, rootNames: string[], host: ts.CompilerHost) {
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
    reset(rootNames: string[], host: ts.CompilerHost) {
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
     * Emits the TypeScript files to the specified target.
     */
    emit(options: EmitOptions = {}) {
        const targetSourceFile = options != null && options.targetSourceFile != null ? options.targetSourceFile.compilerNode : undefined;
        const cancellationToken = undefined; // todo: expose this
        const emitOnlyDtsFiles = options != null && options.emitOnlyDtsFiles != null ? options.emitOnlyDtsFiles : undefined;
        const customTransformers = undefined; // todo: expose this
        const emitResult = this.compilerObject.emit(targetSourceFile, undefined, cancellationToken, emitOnlyDtsFiles, customTransformers);
        return new EmitResult(this.context, emitResult);
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
