import { ts } from "../../../typescript";
import { ProjectContext } from "../../../ProjectContext";
import { ApplyFileTextChangesOptions } from "../../../Project";
import { FileTextChanges } from "./FileTextChanges";

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
    /** @internal */
    private _applied: true | undefined;

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
        if (this._applied)
            return this;

        this._context.project.applyFileTextChanges(this.getChanges(), options);
        this._applied = true;

        return this;
    }

    // TODO: commands property
}
