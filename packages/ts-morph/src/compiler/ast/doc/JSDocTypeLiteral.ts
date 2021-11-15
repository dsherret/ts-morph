import { ts } from "@ts-morph/common";
import { JSDocType } from "./JSDocType";

/**
 * JS doc type literal.
 */
export class JSDocTypeLiteral extends JSDocType<ts.JSDocTypeLiteral> {
  /** Gets if it's an array type. */
  isArrayType() {
    return this.compilerNode.isArrayType;
  }

  /** Gets the JS doc property tags if they exist. */
  getPropertyTags() {
    return this.compilerNode.jsDocPropertyTags ? this.compilerNode.jsDocPropertyTags.map(t => this._getNodeFromCompilerNode(t)) : undefined;
  }
}
