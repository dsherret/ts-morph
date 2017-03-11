import * as ts from "typescript";
import {TsTypeChecker} from "./TsTypeChecker";

/**
 * Wrapper around Program.
 */
export class TsProgram {
    private readonly program: ts.Program;

    constructor(rootNames: string[], compilerOptions: ts.CompilerOptions, host: ts.CompilerHost) {
        this.program = ts.createProgram(rootNames, compilerOptions, host);
    }

    /**
     * Get the program's type checker.
     */
    getTypeChecker() {
        return new TsTypeChecker(this.program.getTypeChecker());
    }
}
