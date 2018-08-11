import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";

/**
 * Result of an emit.
 */
export class EmitResult {
    /** @internal */
    private readonly context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.EmitResult;

    /**
     * @internal
     */
    constructor(context: ProjectContext, compilerObject: ts.EmitResult) {
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
     * If the emit was skipped.
     */
    getEmitSkipped() {
        return this.compilerObject.emitSkipped;
    }

    /**
     * Contains declaration emit diagnostics.
     */
    @Memoize
    getDiagnostics() {
        return this.compilerObject.diagnostics.map(d => this.context.compilerFactory.getDiagnostic(d));
    }

    /*
    // this requires the listEmittedFiles compiler option to be true, but that's not public...
    // todo: revaluate this in TS 2.5 (see if they made it public or not)
    getEmittedFilePaths() {
        return this.compilerEmitResult.emittedFiles;
    }
    */
}
