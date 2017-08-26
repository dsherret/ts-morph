import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {BodyableNodeStructure} from "./../../structures";
import {Node} from "./../common";
import {callBaseFill} from "./../callBaseFill";
import {setBodyTextForNode} from "./BodiedNode";

export type BodyableNodeExtensionType = Node<ts.Node>;

export interface BodyableNode {
    /**
     * Gets if this is a bodyable node.
     * @internal
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
    /**
     * Sets the body text. A body is required to do this operation.
     */
    setBodyText(text: string): this;
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
            const body = (this.compilerNode as any).body as ts.Node;
            return body == null ? undefined : this.global.compilerFactory.getNodeFromCompilerNode(body, this.sourceFile);
        }

        setBodyText(text: string) {
            const body = this.getBodyOrThrow();
            setBodyTextForNode(body, text);
            return this;
        }

        fill(structure: Partial<BodyableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.bodyText != null)
                this.setBodyText(structure.bodyText);

            return this;
        }
    };
}
