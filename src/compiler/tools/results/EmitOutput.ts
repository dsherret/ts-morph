import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { OutputFile } from "./OutputFile";

/**
 * Output of an emit on a single file.
 */
export class EmitOutput {
    /** @internal */
    private readonly context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.EmitOutput;

    /**
     * @internal
     */
    constructor(context: ProjectContext, private readonly filePath: string, compilerObject: ts.EmitOutput) {
        this.context = context;
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
        return this.compilerObject.outputFiles.map(f => new OutputFile(this.context, f));
    }
}
