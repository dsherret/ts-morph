import { ts } from "@ts-morph/common";
import { Node } from "../common";

/**
 * JS doc name reference.
 */
export class JSDocNameReference extends Node<ts.JSDocNameReference> {
  /** Gets the name of the JS doc name reference. */
  getName() {
    return this._getNodeFromCompilerNode(this.compilerNode.name);
  }
}
