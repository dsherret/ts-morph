import { errors, ts } from "@ts-morph/common";
import { Constructor, WriterFunction } from "../../../types";
import { Node } from "../common";
import { getBodyTextWithoutLeadingIndentation, setBodyTextForNode } from "./helpers";

export type BodiedNodeExtensionType = Node<ts.Node & { body: ts.Node; }>;

export interface BodiedNode {
    /**
     * Gets the body.
     */
    getBody(): Node;
    /**
     * Sets the body text.
     * @param textOrWriterFunction - Text or writer function to set as the body.
     */
    setBodyText(textOrWriterFunction: string | WriterFunction): this;
    /**
     * Gets the body text without leading whitespace, leading indentation, or trailing whitespace.
     */
    getBodyText(): string;
}

export function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T {
    return class extends Base implements BodiedNode {
        getBody() {
            const body = this.compilerNode.body;
            if (body == null)
                throw new errors.InvalidOperationError("Bodied node should have a body.");

            return this._getNodeFromCompilerNode(body);
        }

        setBodyText(textOrWriterFunction: string | WriterFunction) {
            const body = this.getBody();
            setBodyTextForNode(body, textOrWriterFunction);
            return this;
        }

        getBodyText() {
            return getBodyTextWithoutLeadingIndentation(this.getBody());
        }
    };
}
