import * as ts from "typescript";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {ModifierableNode} from "./ModifierableNode";

export type StaticableNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface StaticableNode {
    isStatic(): boolean;
    getStaticKeyword(): Node<ts.Node> | undefined;
    setIsStatic(value: boolean, sourceFile?: SourceFile): this;
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

        /**
         * Sets if the node is static.
         * @param value - If it should be static or not.
         * @param sourceFile - Optional source file to help with performance.
         */
        setIsStatic(value: boolean, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            this.toggleModifier("static", value, sourceFile);
            return this;
        }
    };
}
