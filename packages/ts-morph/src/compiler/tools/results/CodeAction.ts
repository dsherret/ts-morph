import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { FileTextChanges } from "./FileTextChanges";

/**
 * Represents a code action.
 */
export class CodeAction<TCompilerObject extends ts.CodeAction = ts.CodeAction> {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: TCompilerObject;

    /** @private */
    constructor(context: ProjectContext, compilerObject: TCompilerObject) {
        this._context = context;
        this._compilerObject = compilerObject;
    }

    /** Gets the compiler object. */
    get compilerObject() {
        return this._compilerObject;
    }

    /** Description of the code action. */
    getDescription() {
        return this.compilerObject.description;
    }

    /** Text changes to apply to each file as part of the code action. */
    getChanges() {
        return this.compilerObject.changes.map(change => new FileTextChanges(this._context, change));
    }

    // TODO: commands property
}
