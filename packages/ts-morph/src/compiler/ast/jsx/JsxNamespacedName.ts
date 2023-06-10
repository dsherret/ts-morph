import { ts } from "@ts-morph/common";
import { JsxNamespacedNameStructure } from "../../../structures";
import { Node } from "../common";

export const JsxNamespacedNameBase = Node;
export class JsxNamespacedName extends JsxNamespacedNameBase<ts.JsxNamespacedName> {
  /** Gets the namespace name node. */
  getNamespaceNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.namespace);
  }

  /** Gets the name node. */
  getNameNode() {
    return this._getNodeFromCompilerNode(this.compilerNode.name);
  }

  set(structure: JsxNamespacedNameStructure) {
    this.getNamespaceNode().replaceWithText(structure.namespace);
    this.getNameNode().replaceWithText(structure.name);
    return this;
  }

  getStructure(): JsxNamespacedNameStructure {
    return {
      namespace: this.getNamespaceNode().getText(),
      name: this.getNameNode().getText(),
    };
  }
}
