import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {Memoize} from "./../../../utils";
import {OutputFile} from "./OutputFile";
import {Diagnostic} from "./Diagnostic";

/**
 * Output of an emit on a single file.
 */
export class EmitOutput {
    /** @internal */
    private readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerObject: ts.EmitOutput;
    /** @internal */
    private readonly _diagnostics: Diagnostic[];

    /**
     * @internal
     */
    constructor(global: GlobalContainer, private readonly filePath: string, compilerObject: ts.EmitOutput) {
        this.global = global;
        this._compilerObject = compilerObject;
        this._diagnostics = this.compilerObject.emitSkipped ? this._getPreEmitDiagnostics() : [];
    }

    /**
     * TypeScript compiler emit result.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the diagnostics when the emit is skipped.
     */
    getDiagnostics() {
        return this._diagnostics;
    }

    /**
     * Gets if the emit was skipped.
     */
    getEmitSkipped() {
        return this.compilerObject.emitSkipped;
    }

    /**
     * Gets the output files.
     */
    @Memoize
    getOutputFiles() {
        return this.compilerObject.outputFiles.map(f => new OutputFile(f));
    }

    private _getPreEmitDiagnostics() {
        const sourceFile = this.global.compilerFactory.getSourceFileFromFilePath(this.filePath)!;
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.global.program.compilerObject, sourceFile.compilerNode);
        return compilerDiagnostics.map(d => new Diagnostic(this.global, d));
    }
}
