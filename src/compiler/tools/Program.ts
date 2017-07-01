import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {TypeChecker} from "./TypeChecker";

/**
 * Wrapper around Program.
 */
export class Program {
    /** @internal */
    private readonly factory: CompilerFactory;
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
    constructor(factory: CompilerFactory, rootNames: string[], compilerOptions: ts.CompilerOptions, host: ts.CompilerHost) {
        this.factory = factory;
        this.typeChecker = new TypeChecker(this.factory);
        this.reset(rootNames, compilerOptions, host);
    }

    /**
     * Resets the program.
     * @internal
     */
    reset(rootNames: string[], compilerOptions: ts.CompilerOptions, host: ts.CompilerHost) {
        this._compilerProgram = ts.createProgram(rootNames, compilerOptions, host, this._compilerProgram);
        this.typeChecker.reset(this._compilerProgram.getTypeChecker());
    }

    /**
     * Get the program's type checker.
     */
    getTypeChecker() {
        return this.typeChecker;
    }
}
