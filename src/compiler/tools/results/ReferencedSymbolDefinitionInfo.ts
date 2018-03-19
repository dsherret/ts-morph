import {ts} from "../../../typescript";
import {GlobalContainer} from "../../../GlobalContainer";
import {Memoize} from "../../../utils";
import {DefinitionInfo} from "./DefinitionInfo";
import {SymbolDisplayPart} from "./SymbolDisplayPart";

export class ReferencedSymbolDefinitionInfo extends DefinitionInfo<ts.ReferencedSymbolDefinitionInfo> {
    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: ts.ReferencedSymbolDefinitionInfo) {
        super(global, compilerObject);
    }

    /**
     * Gets the display parts.
     */
    @Memoize
    getDisplayParts() {
        return this.compilerObject.displayParts.map(p => this.global.compilerFactory.getSymbolDisplayPart(p));
    }
}
