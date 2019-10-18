import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { DocumentSpan } from "./DocumentSpan";

export class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.ImplementationLocation) {
        super(context, compilerObject);
    }

    /**
     * Gets the kind.
     */
    getKind() {
        return this.compilerObject.kind;
    }

    /**
     * Gets the display parts.
     */
    @Memoize
    getDisplayParts() {
        return this.compilerObject.displayParts.map(p => this._context.compilerFactory.getSymbolDisplayPart(p));
    }
}
