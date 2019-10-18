import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { FileTextChanges, ApplyFileTextChangesOptions } from "./FileTextChanges";

/**
 * Represents file changes.
 *
 * @remarks Commands are currently not implemented.
 */
export class CombinedCodeActions {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.CombinedCodeActions;

    /** @private */
    constructor(context: ProjectContext, compilerObject: ts.CombinedCodeActions) {
        this._context = context;
        this._compilerObject = compilerObject;
    }

    /** Gets the compiler object. */
    get compilerObject() {
        return this._compilerObject;
    }

    /** Text changes to apply to each file. */
    @Memoize
    getChanges() {
        return this.compilerObject.changes.map(change => new FileTextChanges(this._context, change));
    }

    /**
     * Executes the combined code actions.
     *
     * WARNING: This will cause all nodes to be forgotten in the changed files.
     * @options - Options used when applying the changes.
     */
    applyChanges(options?: ApplyFileTextChangesOptions) {
        for (const change of this.getChanges())
            change.applyChanges(options);

        return this;
    }

    // TODO: commands property
}
