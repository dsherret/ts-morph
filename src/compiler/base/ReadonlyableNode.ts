import * as ts from "typescript";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {ModifierableNode} from "./ModifierableNode";

export type ReadonlyableNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface ReadonlyableNode {
    isReadonly(): boolean;
    getReadonlyKeyword(): Node<ts.Node> | undefined;
    setIsReadonly(value: boolean, sourceFile?: SourceFile): this;
}

export function ReadonlyableNode<T extends Constructor<ReadonlyableNodeExtensionType>>(Base: T): Constructor<ReadonlyableNode> & T {
    return class extends Base implements ReadonlyableNode {
        /**
         * Gets if it's readonly.
         */
        isReadonly() {
            return this.getReadonlyKeyword() != null;
        }

        /**
         * Gets the readonly keyword, or undefined if none exists.
         */
        getReadonlyKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ReadonlyKeyword);
        }

        /**
         * Sets if this node is readonly.
         * @param value - If readonly or not.
         * @param sourceFile - Optional source file to help improve performance.
         */
        setIsReadonly(value: boolean, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            this.toggleModifier("readonly", value, sourceFile);
            return this;
        }
    };
}
