import * as ts from "typescript";
import {Node} from "./../common";

export type AmbientableNodeExtensionType = Node<ts.Node>;

export interface AmbientableNode {
    hasDeclareKeyword(): boolean;
    getDeclareKeyword(): Node<ts.Node> | undefined;
}

export function AmbientableNode<T extends Constructor<AmbientableNodeExtensionType>>(Base: T): Constructor<AmbientableNode> & T {
    return class extends Base implements AmbientableNode {
        /**
         * If the node has the declare keyword.
         */
        hasDeclareKeyword() {
            return this.getDeclareKeyword() != null;
        }

        /**
         * Gets the declare keyword or undefined if none exists.
         */
        getDeclareKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.DeclareKeyword);
        }
    };
}
