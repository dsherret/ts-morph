import * as ts from "typescript";
import {Node} from "./../common";

export type ReadonlyableNodeExtensionType = Node<ts.Node>;

export interface ReadonlyableNode {
    isReadonly(): boolean;
    getReadonlyKeyword(): Node<ts.Node> | undefined;
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
    };
}
