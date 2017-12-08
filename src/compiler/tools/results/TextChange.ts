import * as ts from "typescript";
import {TextSpan} from "./TextSpan";

/**
 * Represents a text change.
 */
export class TextChange {
    /** @internal */
    private readonly _compilerObject: ts.TextChange;
    private _span: TextSpan | undefined;

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
    getSpan() {
        return this._span || (this._span = new TextSpan(this.compilerObject.span));
    }

    /**
     * Gets the new text.
     */
    getNewText() {
        return this.compilerObject.newText;
    }
}
