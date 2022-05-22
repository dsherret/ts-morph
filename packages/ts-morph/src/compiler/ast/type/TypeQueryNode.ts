import { ts } from "@ts-morph/common";
import { EntityName } from "../aliases";
import { NodeWithTypeArguments } from "./TypeNode";

export class TypeQueryNode extends NodeWithTypeArguments<ts.TypeQueryNode> {
  /**
   * Gets the expression name.
   */
  getExprName(): EntityName {
    return this._getNodeFromCompilerNode(this.compilerNode.exprName);
  }
}
