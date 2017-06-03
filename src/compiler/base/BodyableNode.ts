import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";

export type BodyableNodeExtensionType = Node<ts.Node>;

export interface BodyableNode {
    /**
     * Gets if this is a bodyable node.
     */
    isBodyableNode(): this is BodyableNode;
    /**
     * Gets the body or throws an error if it doesn't exist.
     */
    getBodyOrThrow(): Node;
    /**
     * Gets the body if it exists.
     */
    getBody(): Node | undefined;
}

export function BodyableNode<T extends Constructor<BodyableNodeExtensionType>>(Base: T): Constructor<BodyableNode> & T {
    return class extends Base implements BodyableNode {
        isBodyableNode(): true {
            return true;
        }

        getBodyOrThrow() {
            const body = this.getBody();
            if (body == null)
                throw new errors.InvalidOperationError("A node body is required to do this operation.");
            return body;
        }

        getBody() {
            const body = (this.node as any).body as ts.Node;
            return body == null ? undefined : this.factory.getNodeFromCompilerNode(body);
        }
    };
}
