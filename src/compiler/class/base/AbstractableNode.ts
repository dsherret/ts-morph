import * as ts from "typescript";
import {Node} from "./../../common";
import {ModifierableNode} from "./../../base";

export type AbstractableNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface AbstractableNode {
    getIsAbstract(): boolean;
    getAbstractKeyword(): Node<ts.Node> | undefined;
    setIsAbstract(isAbstract: boolean): this;
}

export function AbstractableNode<T extends Constructor<AbstractableNodeExtensionType>>(Base: T): Constructor<AbstractableNode> & T {
    return class extends Base implements AbstractableNode {
        /**
         * Gets if the node is abstract.
         */
        getIsAbstract() {
            return this.getAbstractKeyword() != null;
        }

        /**
         * Gets the abstract keyword or undefined if it doesn't exist.
         */
        getAbstractKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.AbstractKeyword);
        }

        /**
         * Sets if the node is abstract.
         * @param isAbstract - If it should be abstract or not.
         */
        setIsAbstract(isAbstract: boolean) {
            this.toggleModifier("abstract", isAbstract);
            return this;
        }
    };
}
