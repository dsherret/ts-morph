import { ts } from "@ts-morph/common";
import { JSDocType } from "./JSDocType";

/**
 * JS doc non-nullable type.
 */
export class JSDocNonNullableType extends JSDocType<ts.JSDocNonNullableType> {
  /** Gets the type node of the JS doc non-nullable type node. */
  getTypeNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.type);
  }

  isPostfix() {
    return this.compilerNode.postfix;
  }
}
