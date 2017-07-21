import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";
import {TypeChecker} from "./TypeChecker";
import {SourceFile} from "./../file";
import {EmitResult} from "./EmitResult";

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
    private _compilerProgram: ts.Program;

    /**
     * Gets the underlying compiler program.
     */
    get compilerProgram() {
        return this._compilerProgram;
    }

    /** @internal */
    constructor(global: GlobalContainer, rootNames: string[], host: ts.CompilerHost) {
        this.global = global;
        this.typeChecker = new TypeChecker(this.global);
        this.reset(rootNames, host);
    }

    /**
     * Resets the program.
     * @internal
     */
    reset(rootNames: string[], host: ts.CompilerHost) {
        this._compilerProgram = ts.createProgram(rootNames, this.global.compilerOptions, host, this._compilerProgram);
        this.typeChecker.reset(this._compilerProgram.getTypeChecker());
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
        const emitResult = this.compilerProgram.emit(targetSourceFile, undefined, cancellationToken, emitOnlyDtsFiles, customTransformers);
        return new EmitResult(this.global, emitResult);
    }
}
