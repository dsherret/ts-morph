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
    private _compilerObject: ts.Program;

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
        return this._compilerObject;
    }

    /**
     * Resets the program.
     * @internal
     */
    reset(rootNames: string[], host: ts.CompilerHost) {
        const compilerOptions = this.global.compilerOptions;
        const oldProgram = this._compilerObject;
        this._compilerObject = getNewProgram();
        this.typeChecker.reset(this._compilerObject.getTypeChecker());

        function getNewProgram() {
            try {
                // try to reuse the old compiler object
                return ts.createProgram(rootNames, compilerOptions, host, oldProgram);
            } catch (err) {
                Logger.warn("Could not create new program from old program. " + err);
                // if that fails, try without using the old program
                return ts.createProgram(rootNames, compilerOptions, host);
            }
        }
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
