import { ts } from "../../../typescript";
import { ProjectContext } from "../../../ProjectContext";
import { FileTextChanges } from "./FileTextChanges";

/**
 * Represents file changes.
 *
 * Commands are currently not implemented.
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
    getChanges() {
        return this.compilerObject.changes.map(change => new FileTextChanges(this._context, change));
    }

    // TODO: commands property
}
