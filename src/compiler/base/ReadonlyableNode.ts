import * as ts from "typescript";
import {Node} from "./../common";
import {SourceFile} from "./../file";
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
     * @param sourceFile - Optional source file to help improve performance.
     */
    setIsReadonly(value: boolean, sourceFile?: SourceFile): this;
}

export function ReadonlyableNode<T extends Constructor<ReadonlyableNodeExtensionType>>(Base: T): Constructor<ReadonlyableNode> & T {
    return class extends Base implements ReadonlyableNode {
        isReadonly() {
            return this.getReadonlyKeyword() != null;
        }

        getReadonlyKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ReadonlyKeyword);
        }

        setIsReadonly(value: boolean, sourceFile: SourceFile = this.getSourceFileOrThrow()) {
            this.toggleModifier("readonly", value, sourceFile);
            return this;
        }
    };
}
