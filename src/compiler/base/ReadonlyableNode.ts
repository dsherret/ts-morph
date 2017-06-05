import * as ts from "typescript";
import {Node} from "./../common";
import {ModifierableNode} from "./ModifierableNode";

export type ReadonlyableNodeExtensionType = Node & ModifierableNode;

export interface ReadonlyableNode {
    /**
     * Gets if it's readonly.
     */
    isReadonly(): boolean;
    /**
     * Gets the readonly keyword, or undefined if none exists.
     */
    getReadonlyKeyword(): Node | undefined;
    /**
     * Sets if this node is readonly.
     * @param value - If readonly or not.
     */
    setIsReadonly(value: boolean): this;
}

export function ReadonlyableNode<T extends Constructor<ReadonlyableNodeExtensionType>>(Base: T): Constructor<ReadonlyableNode> & T {
    return class extends Base implements ReadonlyableNode {
        isReadonly() {
            return this.getReadonlyKeyword() != null;
        }

        getReadonlyKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ReadonlyKeyword);
        }

        setIsReadonly(value: boolean) {
            this.toggleModifier("readonly", value);
            return this;
        }
    };
}
