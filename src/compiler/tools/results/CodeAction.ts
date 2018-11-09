import { ts } from "../../../typescript";
import {FileTextChanges} from "./FileTextChanges";

/**
 * Represents a code action.
 */
export class CodeAction<TCompilerObject extends ts.CodeAction = ts.CodeAction> {
    /** @internal */
    private readonly _compilerObject: TCompilerObject;

    /** @private */
    constructor(compilerObject: TCompilerObject) {
        this._compilerObject = compilerObject;
    }

    /** Gets the compiler text change. */
    get compilerObject() {
        return this._compilerObject;
    }

    /** Description of the code action. */
    getDescription() {
        return this.compilerObject.description;
    }

    /** Text changes to apply to each file as part of the code action. */
    getChanges() {
        return this.compilerObject.changes.map(change => new FileTextChanges(change));
    }

    // TODO: commands property
}
