import { ts } from "@ts-morph/common";
import { NamedNode } from "../base";
import { Node } from "../common";

export class JsxNamespacedName extends NamedNode(Node)<ts.JsxNamespacedName> {
  /** Gets the namespace name node. */
  getNamespaceNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.namespace);
  }
}
