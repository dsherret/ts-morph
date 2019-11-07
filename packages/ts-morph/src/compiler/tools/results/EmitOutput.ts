import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { OutputFile } from "./OutputFile";

/**
 * Output of an emit on a single file.
 */
export class EmitOutput {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.EmitOutput;

    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.EmitOutput) {
        this._context = context;
        this._compilerObject = compilerObject;
    }

    /**
     * TypeScript compiler emit result.
     */
    get compilerObject() {
        return this._compilerObject;
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
        return this.compilerObject.outputFiles.map(f => new OutputFile(this._context, f));
    }
}
