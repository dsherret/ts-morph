import { Constructor } from "../../types";
import { SyntaxKind } from "../../typescript";
import { Node } from "../common";
import { NamespaceDeclaration } from "./NamespaceDeclaration";

export type NamespaceChildableNodeExtensionType = Node;

export interface NamespaceChildableNode {
    /**
     * Gets the parent namespace or undefined if it doesn't exist.
     */
    getParentNamespace(): NamespaceDeclaration | undefined;
}

export function NamespaceChildableNode<T extends Constructor<NamespaceChildableNodeExtensionType>>(Base: T): Constructor<NamespaceChildableNode> & T {
    return class extends Base implements NamespaceChildableNode {
        getParentNamespace() {
            let parent = this.getParentOrThrow();
            if (parent.getKind() !== SyntaxKind.ModuleBlock)
                return undefined;

            while (parent.getParentOrThrow().getKind() === SyntaxKind.ModuleDeclaration)
                parent = parent.getParentOrThrow();

            return parent as NamespaceDeclaration;
        }
    };
}
