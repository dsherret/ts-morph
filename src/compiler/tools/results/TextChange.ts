import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { TextSpan } from "./TextSpan";

/**
 * Represents a text change.
 */
export class TextChange {
    /** @internal */
    private readonly _compilerObject: ts.TextChange;

    /** @internal */
    constructor(compilerObject: ts.TextChange) {
        this._compilerObject = compilerObject;
    }

    /** Gets the compiler text change. */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the text span.
     */
    @Memoize
    getSpan() {
        return new TextSpan(this.compilerObject.span);
    }

    /**
     * Gets the new text.
     */
    getNewText() {
        return this.compilerObject.newText;
    }
}
