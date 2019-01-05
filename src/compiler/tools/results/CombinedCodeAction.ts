import { ts } from "../../../typescript";
import {FileTextChanges} from "./FileTextChanges";

/**
 * Represents file changes.
 *
 * Commands are currently not implemented.
 */
export class CombinedCodeActions {
    /** @internal */
    private readonly _compilerObject: ts.CombinedCodeActions;

    /** @private */
    constructor(compilerObject: ts.CombinedCodeActions) {
        this._compilerObject = compilerObject;
    }

    /** Gets the compiler object. */
    get compilerObject() {
        return this._compilerObject;
    }

    /** Text changes to apply to each file. */
    getChanges() {
        return this.compilerObject.changes.map(change => new FileTextChanges(change));
    }

    // TODO: commands property
}
