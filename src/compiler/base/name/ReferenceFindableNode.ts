import { ts } from "../../../typescript";
import { Constructor } from "../../../types";
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
    /**
     * Gets the nodes that reference the definition of the node.
     * @deprecated Use `findReferencesAsNodes()`
     */
    getReferencingNodes(): Node[];
}

export function ReferenceFindableNode<T extends Constructor<ReferenceFindableNodeExtensionType>>(Base: T): Constructor<ReferenceFindableNode> & T {
    return class extends Base implements ReferenceFindableNode {
        findReferences() {
            return this.global.languageService.findReferences(getNodeForReferences(this));
        }

        findReferencesAsNodes() {
            return this.global.languageService.findReferencesAsNodes(getNodeForReferences(this));
        }

        getReferencingNodes() {
            return this.findReferencesAsNodes();
        }
    };
}

function getNodeForReferences(node: ReferenceFindableNodeExtensionType) {
    if (TypeGuards.isIdentifier(node))
        return node;
    if (node.compilerNode.name != null)
        return node.getNodeProperty("name");
    if (TypeGuards.isExportableNode(node))
        return node.getDefaultKeyword() || node;
    return node;
}
