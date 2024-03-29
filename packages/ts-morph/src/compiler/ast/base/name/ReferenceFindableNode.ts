import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { ReferencedSymbol } from "../../../tools";
import { Node } from "../../common";

export type ReferenceFindableNodeExtensionType = Node<ts.Node & { name?: ts.PropertyName | ts.BindingName | ts.DeclarationName | ts.StringLiteral }>;

export interface ReferenceFindableNode {
  /**
   * Finds the references of the definition of the node.
   */
  findReferences(): ReferencedSymbol[];
  /**
   * Finds the nodes that reference the definition of the node.
   */
  findReferencesAsNodes(): Node[];
}

export function ReferenceFindableNode<T extends Constructor<ReferenceFindableNodeExtensionType>>(Base: T): Constructor<ReferenceFindableNode> & T {
  return class extends Base implements ReferenceFindableNode {
    findReferences() {
      return this._context.languageService.findReferences(getNodeForReferences(this));
    }

    findReferencesAsNodes() {
      return this._context.languageService.findReferencesAsNodes(getNodeForReferences(this));
    }
  };
}

function getNodeForReferences(node: ReferenceFindableNodeExtensionType) {
  if (Node.isIdentifier(node) || Node.isStringLiteral(node))
    return node;
  const nameNode = node.getNodeProperty("name");
  if (nameNode != null)
    return nameNode;
  if (Node.isExportable(node))
    return node.getDefaultKeyword() || node;
  return node;
}
