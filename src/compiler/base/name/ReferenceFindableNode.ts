import { ts } from "../../../typescript";
import { Constructor } from "../../../Constructor";
import { TypeGuards } from "../../../utils";
import { Node } from "../../common";
import { ReferencedSymbol } from "../../tools";

export type ReferenceFindableNodeExtensionType = Node<ts.Node & { name?: ts.PropertyName | ts.BindingName; }>;

export interface ReferenceFindableNode {
    /**
     * Finds the references of the node.
     */
    findReferences(): ReferencedSymbol[];
    /**
     * Gets the nodes that reference the definition of the node.
     */
    getReferencingNodes(): Node[];
}

export function ReferenceFindableNode<T extends Constructor<ReferenceFindableNodeExtensionType>>(Base: T): Constructor<ReferenceFindableNode> & T {
    return class extends Base implements ReferenceFindableNode {
        findReferences() {
            return this.global.languageService.findReferences(getNodeForReferences(this));
        }

        getReferencingNodes() {
            return this.global.languageService.getDefinitionReferencingNodes(getNodeForReferences(this));
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
