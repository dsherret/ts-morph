import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class OptionalTypeNode extends TypeNode<ts.OptionalTypeNode> {
  /** Gets the optional type node's inner type. */
  getTypeNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.type);
  }
}
