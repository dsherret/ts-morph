import { ts } from "@ts-morph/common";
import { JSDocType } from "./JSDocType";

/**
 * JS doc namepath type.
 */
export class JSDocNamepathType extends JSDocType<ts.JSDocNamepathType> {
  /** Gets the type node of the JS doc namepath node. */
  getTypeNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.type);
  }
}
