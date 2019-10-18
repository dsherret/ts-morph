import { unwrapNode } from "../../../manipulation";
import { Constructor } from "../../../types";
import { Node } from "../common";

export type UnwrappableNodeExtensionType = Node;

export interface UnwrappableNode {
    /**
     * Replaces the node's text with its body's statements.
     */
    unwrap(): void;
}

export function UnwrappableNode<T extends Constructor<UnwrappableNodeExtensionType>>(Base: T): Constructor<UnwrappableNode> & T {
    return class extends Base implements UnwrappableNode {
        unwrap() {
            unwrapNode(this);
        }
    };
}
