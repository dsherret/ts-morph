import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {TypeChecker} from "./TypeChecker";

/**
 * Wrapper around Program.
 */
export class Program {
    private readonly program: ts.Program;

    constructor(private readonly factory: CompilerFactory, rootNames: string[], compilerOptions: ts.CompilerOptions, host: ts.CompilerHost) {
        this.program = ts.createProgram(rootNames, compilerOptions, host);
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
        return new TypeChecker(this.factory, this.program.getTypeChecker());
    }
}
