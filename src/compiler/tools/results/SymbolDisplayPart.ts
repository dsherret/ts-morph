import * as ts from "typescript";

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

    /** Gets the compiler text span. */
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
     */
    getKind() {
        return this.compilerObject.kind;
    }
}
