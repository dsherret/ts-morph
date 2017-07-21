import * as ts from "typescript";
import {Diagnostic} from "./Diagnostic";
import {GlobalContainer} from "./../../GlobalContainer";

/**
 * Result of an emit.
 */
export class EmitResult {
    private readonly global: GlobalContainer;
    private readonly _compilerEmitResult: ts.EmitResult;

    /**
     * TypeScript compiler emit result.
     */
    get compilerEmitResult() {
        return this._compilerEmitResult;
    }

    /**
     * @internal
     */
    constructor(global: GlobalContainer, emitResult: ts.EmitResult) {
        this.global = global;
        this._compilerEmitResult = emitResult;
    }

    /**
     * If the emit was skipped.
     */
    getEmitSkipped() {
        return this.compilerEmitResult.emitSkipped;
    }

    /**
     * Contains declaration emit diagnostics.
     */
    getDiagnostics() {
        return this.compilerEmitResult.diagnostics.map(d => new Diagnostic(this.global, d));
    }

    /*
    // this requires the listEmittedFiles compiler option to be true, but that's not public...
    // todo: revaluate this in TS 2.5 (see if they made it public or not)
    getEmittedFilePaths() {
        return this.compilerEmitResult.emittedFiles;
    }
    */
}
