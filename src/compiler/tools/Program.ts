import * as ts from "typescript";
import {TypeChecker} from "./TypeChecker";

/**
 * Wrapper around Program.
 */
export class Program {
    private readonly program: ts.Program;

    constructor(rootNames: string[], compilerOptions: ts.CompilerOptions, host: ts.CompilerHost) {
        this.program = ts.createProgram(rootNames, compilerOptions, host);
    }

    /**
     * Get the program's type checker.
     */
    getTypeChecker() {
        return new TypeChecker(this.program.getTypeChecker());
    }
}
