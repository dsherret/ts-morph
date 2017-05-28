import * as ts from "typescript";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {ModifierableNode} from "./ModifierableNode";

export type AsyncableNodeExtensionType = Node & ModifierableNode;

export interface AsyncableNode {
    /**
     * If it's async.
     */
    isAsync(): boolean;
    /**
     * Gets the async keyword or undefined if none exists.
     */
    getAsyncKeyword(): Node<ts.Modifier> | undefined;
    /**
     * Sets if the node is async.
     * @param value - If it should be async or not.
     * @param sourceFile - Optional source file to help improve performance.
     */
    setIsAsync(value: boolean, sourceFile?: SourceFile): this;
}

export function AsyncableNode<T extends Constructor<AsyncableNodeExtensionType>>(Base: T): Constructor<AsyncableNode> & T {
    return class extends Base implements AsyncableNode {
        isAsync() {
            return this.hasModifier(ts.SyntaxKind.AsyncKeyword);
        }

        getAsyncKeyword(): Node<ts.Modifier> | undefined {
            return this.getFirstModifierByKind(ts.SyntaxKind.AsyncKeyword);
        }

        setIsAsync(value: boolean, sourceFile: SourceFile = this.getSourceFileOrThrow()) {
            this.toggleModifier("async", value, sourceFile);
            return this;
        }
    };
}
