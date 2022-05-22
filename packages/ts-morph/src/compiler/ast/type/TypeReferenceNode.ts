import { ts } from "@ts-morph/common";
import { EntityName } from "../aliases";
import { NodeWithTypeArguments } from "./TypeNode";

export class TypeReferenceNode extends NodeWithTypeArguments<ts.TypeReferenceNode> {
  /**
   * Gets the type name.
   */
  getTypeName(): EntityName {
    return this._getNodeFromCompilerNode(this.compilerNode.typeName);
  }
}
