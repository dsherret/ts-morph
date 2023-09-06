import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class RestTypeNode extends TypeNode<ts.RestTypeNode> {
  /** Gets the rest type node's inner type. */
  getTypeNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.type);
  }
}
