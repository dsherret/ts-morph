import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { DefinitionInfo } from "./DefinitionInfo";

/**
 * Breaking change: `getDisplayParts()` is gone. tsgo does not build the
 * highlighted signature text the `typescript` package returned with a definition.
 */
export class ReferencedSymbolDefinitionInfo extends DefinitionInfo<ts.ReferencedSymbolDefinitionInfo> {
  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: ts.ReferencedSymbolDefinitionInfo) {
    super(context, compilerObject);
  }
}
