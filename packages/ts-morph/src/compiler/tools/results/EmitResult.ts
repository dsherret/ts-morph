import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";

/**
 * Result of an emit.
 */
export class EmitResult {
    /** @internal */
    protected readonly _context: ProjectContext;
    /** @internal */
    protected readonly _compilerObject: ts.EmitResult;

    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.EmitResult) {
        this._context = context;
        this._compilerObject = compilerObject;

        // memoize because diagnostics have dependencies that need to be memoized
        this.getDiagnostics();
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
     *
     * If the `noEmitOnError` compiler option is true, this will also include the program's semantic, syntactic, global, options, and if enabled declaration diagnostics.
     * @remarks If you are looking for non-declaration emit diagnostics, then call `Project#getPreEmitDiagnostics()` or get specific diagnostics available from the program.
     */
    @Memoize
    getDiagnostics() {
        return this.compilerObject.diagnostics.map(d => this._context.compilerFactory.getDiagnostic(d));
    }

    /*
    // this requires the listEmittedFiles compiler option to be true, but that's not public...
    // todo: revaluate this to see if they've made it public yet
    getEmittedFilePaths() {
        return this.compilerEmitResult.emittedFiles;
    }
    */
}
