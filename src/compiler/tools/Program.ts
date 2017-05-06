import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {TypeChecker} from "./TypeChecker";

/**
 * Wrapper around Program.
 */
export class Program {
    /** @internal */
    private readonly factory: CompilerFactory;
    private readonly typeChecker: TypeChecker;
    private program: ts.Program;

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
        this.program = ts.createProgram(rootNames, compilerOptions, host);
        this.typeChecker.reset(this.program.getTypeChecker());
    }

    /**
     * Gets the underlying compiler program.
     */
    getCompilerProgram() {
        return this.program;
    }

    /**
     * Get the program's type checker.
     */
    getTypeChecker() {
        return this.typeChecker;
    }
}
