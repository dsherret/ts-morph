import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";

/**
 * Result of an emit.
 */
export class EmitResult {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.EmitResult;

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
     * This is the semantic, syntactic, global, options, and if enabled declaration diagnostics.
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

/**
 * The emitted file in memory.
 */
export interface MemoryEmitResultFile {
    /**
     * File path that was emitted to.
     */
    filePath: string;
    /**
     * The text that was emitted.
     */
    text: string;
    /**
     * Whether the byte order mark should be written.
     */
    writeByteOrderMark: boolean;
}

/**
 * Result of an emit to memory.
 */
export class MemoryEmitResult extends EmitResult {
    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.EmitResult, private readonly _files: ReadonlyArray<MemoryEmitResultFile>) {
        super(context, compilerObject);
    }

    /**
     * Gets the files that were emitted to memory.
     */
    getFiles() {
        return this._files as MemoryEmitResultFile[]; // assert mutable array
    }
}
