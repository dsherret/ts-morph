import { Constructor } from "../../../types";
import { errors, SyntaxKind } from "@ts-morph/common";
import { Node } from "../common";
import { NamespaceDeclaration } from "./NamespaceDeclaration";

export type NamespaceChildableNodeExtensionType = Node;

export interface NamespaceChildableNode {
    /**
     * Gets the parent namespace or undefined if it doesn't exist.
     */
    getParentNamespace(): NamespaceDeclaration | undefined;

    /**
     * Gets the parent namespace or throws if it doesn't exist.
     */
    getParentNamespaceOrThrow(): NamespaceDeclaration;
}

export function NamespaceChildableNode<T extends Constructor<NamespaceChildableNodeExtensionType>>(Base: T): Constructor<NamespaceChildableNode> & T {
    return class extends Base implements NamespaceChildableNode {
        getParentNamespaceOrThrow() {
            return errors.throwIfNullOrUndefined(this.getParentNamespace(), "Expected to find the parent namespace.");
        }

        getParentNamespace() {
            let parent = this.getParentOrThrow();
            if (!Node.isModuleBlock(parent))
                return undefined;

            while (parent.getParentOrThrow().getKind() === SyntaxKind.ModuleDeclaration)
                parent = parent.getParentOrThrow();

            return parent as NamespaceDeclaration;
        }
    };
}
