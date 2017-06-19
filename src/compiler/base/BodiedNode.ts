import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {Node} from "./../common";

export type BodiedNodeExtensionType = Node<ts.Node>;

export interface BodiedNode {
    /**
     * Gets if this is a bodyable node.
     */
    isBodiedNode(): this is BodiedNode;
    /**
     * Gets the body.
     */
    getBody(): Node;
}

export function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T {
    return class extends Base implements BodiedNode {
        isBodiedNode() {
            return true;
        }

        getBody() {
            const body = (this.compilerNode as any).body as ts.Node;
            if (body == null)
                throw new errors.InvalidOperationError("Bodied node should have a body.");

            return this.factory.getNodeFromCompilerNode(body, this.sourceFile);
        }
    };
}
