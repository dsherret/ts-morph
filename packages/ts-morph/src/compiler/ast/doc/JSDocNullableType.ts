import { ts } from "@ts-morph/common";
import { JSDocType } from "./JSDocType";

/**
 * JS doc nullable type.
 */
export class JSDocNullableType extends JSDocType<ts.JSDocNullableType> {
  /** Gets the type node of the JS doc nullable type node. */
  getTypeNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.type);
  }

  isPostfix() {
    return this.compilerNode.postfix;
  }
}
