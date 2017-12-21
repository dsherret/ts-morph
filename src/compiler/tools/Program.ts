import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";
import {Logger} from "./../../utils";
import {TypeChecker} from "./TypeChecker";
import {SourceFile} from "./../file";
import {EmitResult} from "./results";

/**
 * Options for emitting.
 */
export interface EmitOptions {
    // warning: When updating these emit options, also update the options in SourceFile
    // todo: better way of doing this

    /**
     * Optional source file to only emit.
     */
    targetSourceFile?: SourceFile;
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
    private readonly global: GlobalContainer;
    /** @internal */
    private readonly typeChecker: TypeChecker;
    /** @internal */
    private _createdCompilerObject: ts.Program | undefined;
    /** @internal */
    private _getOrCreateCompilerObject: () => ts.Program;

    /** @internal */
    constructor(global: GlobalContainer, rootNames: string[], host: ts.CompilerHost) {
        this.global = global;
        this.typeChecker = new TypeChecker(this.global);
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
        const compilerOptions = this.global.compilerOptions;
        this._getOrCreateCompilerObject = () => {
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
        return new EmitResult(this.global, emitResult);
    }
}
