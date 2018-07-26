import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { TypeGuards } from "../../../utils";
import { Node } from "../../common";
import { ReferencedSymbol } from "../../tools";

export type ReferenceFindableNodeExtensionType = Node<ts.Node & { name?: ts.PropertyName | ts.BindingName; }>;

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
            return this.context.languageService.findReferences(getNodeForReferences(this));
        }

        findReferencesAsNodes() {
            return this.context.languageService.findReferencesAsNodes(getNodeForReferences(this));
        }
    };
}

function getNodeForReferences(node: ReferenceFindableNodeExtensionType) {
    if (TypeGuards.isIdentifier(node))
        return node;
    const nameNode = node.getNodeProperty("name");
    if (nameNode != null)
        return nameNode;
    if (TypeGuards.isExportableNode(node))
        return node.getDefaultKeyword() || node;
    return node;
}
