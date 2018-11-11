import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { DefinitionInfo } from "./DefinitionInfo";

export class ReferencedSymbolDefinitionInfo extends DefinitionInfo<ts.ReferencedSymbolDefinitionInfo> {
    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.ReferencedSymbolDefinitionInfo) {
        super(context, compilerObject);
    }

    /**
     * Gets the display parts.
     */
    @Memoize
    getDisplayParts() {
        return this.compilerObject.displayParts.map(p => this._context.compilerFactory.getSymbolDisplayPart(p));
    }
}
