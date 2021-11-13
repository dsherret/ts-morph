import { ts } from "@ts-morph/common";
import { EntityName } from "../aliases";
import { TypeNode } from "./TypeNode";

export class TypeQueryNode extends TypeNode<ts.TypeQueryNode> {
  /**
   * Gets the expression name.
   */
  getExprName(): EntityName {
    return this._getNodeFromCompilerNode(this.compilerNode.exprName);
  }
}
