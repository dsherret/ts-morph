import * as ts from "typescript";
import {Node} from "./../common";
import {Decorator} from "./../decorator/Decorator";

export type DecoratableNodeExtensionType = Node<ts.Node & { decorators: ts.NodeArray<ts.Decorator>; }>;

export interface DecoratableNode {
    /**
     * Gets all the decorators of the node.
     */
    getDecorators(): Decorator[];
}

export function DecoratableNode<T extends Constructor<DecoratableNodeExtensionType>>(Base: T): Constructor<DecoratableNode> & T {
    return class extends Base implements DecoratableNode {
        getDecorators(): Decorator[] {
            if (this.node.decorators == null)
                return [];
            return this.node.decorators.map(d => this.factory.getDecorator(d));
        }
    };
}
