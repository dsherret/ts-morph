import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";
import {TypeChecker} from "./TypeChecker";

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
}
