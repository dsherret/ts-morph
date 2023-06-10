import { ts } from "@ts-morph/common";
import { JsxNamespacedNameStructure } from "../../../structures";
import { Node } from "../common";

export class JsxNamespacedName extends Node<ts.JsxNamespacedName> {
  /** Gets the namespace name node. */
  getNamespaceNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.namespace);
  }

  /** Gets the name node. */
  getNameNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.name);
  }

  getStructure(): JsxNamespacedNameStructure {
    return {
      namespace: this.getNamespaceNode().getText(),
      name: this.getNameNode().getText(),
    };
  }
}
