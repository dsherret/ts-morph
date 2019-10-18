import { ts } from "@ts-morph/common";
import { DocumentSpan } from "./DocumentSpan";

/**
 * Rename location.
 */
export class RenameLocation extends DocumentSpan<ts.RenameLocation> {
    /** Gets the text to insert before the rename. */
    getPrefixText() {
        return this._compilerObject.prefixText;
    }

    /** Gets the text to insert after the rename. */
    getSuffixText() {
        return this._compilerObject.suffixText;
    }
}
