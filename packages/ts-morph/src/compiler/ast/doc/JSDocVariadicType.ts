import { ts } from "@ts-morph/common";
import { JSDocType } from "./JSDocType";

/**
 * JS doc variadic type.
 */
export class JSDocVariadicType extends JSDocType<ts.JSDocVariadicType> {
  /** Gets the type node of the JS doc variadic type node. */
  getTypeNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.type);
  }
}
