import { ts } from "@ts-morph/common";
import { JSDocType } from "./JSDocType";

/**
 * JS doc optional type.
 */
export class JSDocOptionalType extends JSDocType<ts.JSDocOptionalType> {
  /** Gets the type node of the JS doc optional type node. */
  getTypeNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.type);
  }
}
