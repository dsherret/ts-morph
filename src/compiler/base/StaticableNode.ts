import * as ts from "typescript";
import {Node} from "./../common";
import {ModifierableNode} from "./ModifierableNode";

export type StaticableNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface StaticableNode {
    isStatic(): boolean;
    getStaticKeyword(): Node<ts.Node> | undefined;
}

export function StaticableNode<T extends Constructor<StaticableNodeExtensionType>>(Base: T): Constructor<StaticableNode> & T {
    return class extends Base implements StaticableNode {
        /**
         * Gets if it's static.
         */
        isStatic() {
            return this.getStaticKeyword() != null;
        }

        /**
         * Gets the static keyword, or undefined if none exists.
         */
        getStaticKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.StaticKeyword);
        }
    };
}
