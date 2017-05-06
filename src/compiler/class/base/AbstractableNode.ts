import * as ts from "typescript";
import {Node} from "./../../common";
import {SourceFile} from "./../../file";
import {ModifierableNode} from "./../../base";

export type AbstractableNodeExtensionType = Node & ModifierableNode;

export interface AbstractableNode {
    getIsAbstract(): boolean;
    getAbstractKeyword(): Node | undefined;
    setIsAbstract(isAbstract: boolean, sourceFile?: SourceFile): this;
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
         * @param sourceFile - Optional source file to help with performance.
         */
        setIsAbstract(isAbstract: boolean, sourceFile?: SourceFile) {
            this.toggleModifier("abstract", isAbstract, sourceFile);
            return this;
        }
    };
}
