import { ts } from "@ts-morph/common";
import { EntityName } from "../aliases";
import { Node } from "../common";
import { Identifier } from "./Identifier";

export class QualifiedName extends Node<ts.QualifiedName> {
  /**
   * Gets the left side of the qualified name.
   */
  getLeft(): EntityName {
    return this._getNodeFromCompilerNode(this.compilerNode.left);
  }

  /**
   * Gets the right identifier of the qualified name.
   */
  getRight(): Identifier {
    // the compiler declares the right side as possibly a private identifier, which the
    // parser never produces there
    return this._getNodeFromCompilerNode(this.compilerNode.right as ts.Identifier);
  }
}
