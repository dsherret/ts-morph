import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { DocumentSpan } from "./DocumentSpan";

export class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
    /**
     * @internal
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
        return this.compilerObject.displayParts.map(p => this.context.compilerFactory.getSymbolDisplayPart(p));
    }
}
