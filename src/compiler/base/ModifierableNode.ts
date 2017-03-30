import * as ts from "typescript";
import {Node} from "./../common";

export type ModiferableNodeExtensionType = Node<ts.Node>;

export interface ModifierableNode {
    getModifiers(): Node<ts.Node>[];
    getCombinedModifierFlags(): ts.ModifierFlags;
    getFirstModifierByKind(kind: ts.SyntaxKind): Node<ts.Node> | undefined;
}

export function ModifierableNode<T extends Constructor<ModiferableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T {
    return class extends Base implements ModifierableNode {
        /**
         * Gets the node's modifiers.
         */
        getModifiers() {
            return this.node.modifiers == null ? [] : this.node.modifiers.map(m => this.factory.getNodeFromCompilerNode(m));
        }

        /**
         * Gets the combined modifier flags.
         */
        getCombinedModifierFlags() {
            return ts.getCombinedModifierFlags(this.node);
        }

        /**
         * Gets the first modifier of the specified syntax kind or undefined if none found.
         * @param kind - Syntax kind.
         */
        getFirstModifierByKind(kind: ts.SyntaxKind) {
            for (let modifier of this.getModifiers()) {
                if (modifier.getKind() === kind)
                    return modifier;
            }

            return undefined;
        }
    };
}
