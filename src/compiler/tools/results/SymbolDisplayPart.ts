import { ts } from "../../../typescript";

/**
 * Symbol display part.
 */
export class SymbolDisplayPart {
    /** @internal */
    private readonly _compilerObject: ts.SymbolDisplayPart;

    /** @internal */
    constructor(compilerObject: ts.SymbolDisplayPart) {
        this._compilerObject = compilerObject;
    }

    /** Gets the compiler symbol display part. */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the text.
     */
    getText() {
        return this.compilerObject.text;
    }

    /**
     * Gets the kind.
     *
     * Examples: "text", "lineBreak"
     */
    getKind() {
        return this.compilerObject.kind;
    }
}
