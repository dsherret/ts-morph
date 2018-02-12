import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {Memoize} from "./../../../utils";
import {ScriptElementKind} from "./../../polyfills";
import {DocumentSpan} from "./DocumentSpan";
import {SymbolDisplayPart} from "./SymbolDisplayPart";

export class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: ts.ImplementationLocation) {
        super(global, compilerObject);
    }

    /**
     * Gets the kind.
     */
    getKind() {
        return this.compilerObject.kind as ScriptElementKind;
    }

    /**
     * Gets the display parts.
     */
    @Memoize
    getDisplayParts() {
        return this.compilerObject.displayParts.map(p => new SymbolDisplayPart(p));
    }
}
