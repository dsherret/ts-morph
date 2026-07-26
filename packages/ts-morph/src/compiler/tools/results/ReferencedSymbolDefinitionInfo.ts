import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { DefinitionInfo } from "./DefinitionInfo";
import { SymbolDisplayPart } from "./SymbolDisplayPart";

export class ReferencedSymbolDefinitionInfo extends DefinitionInfo<ts.ReferencedSymbolDefinitionInfo> {
  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: ts.ReferencedSymbolDefinitionInfo) {
    super(context, compilerObject);
  }

  /**
   * Gets the display parts.
   *
   * Breaking change: a part's `getKind()` is an LSP classification name rather
   * than one of the `typescript` package's `SymbolDisplayPartKind` names.
   */
  getDisplayParts() {
    return this.compilerObject.displayParts.map(p => new SymbolDisplayPart(p));
  }
}
