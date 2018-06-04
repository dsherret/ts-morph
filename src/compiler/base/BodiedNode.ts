import * as errors from "../../errors";
import { BodiedNodeStructure } from "../../structures";
import { Constructor, WriterFunction } from "../../types";
import { ts } from "../../typescript";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { setBodyTextForNode } from "./helpers/setBodyTextForNode";

export type BodiedNodeExtensionType = Node<ts.Node & { body: ts.Node; }>;

export interface BodiedNode {
    /**
     * Gets the body.
     */
    getBody(): Node;
    /**
     * Sets the body text.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: WriterFunction): this;
    /**
     * Sets the body text.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
}

export function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T {
    return class extends Base implements BodiedNode {
        getBody() {
            const body = this.compilerNode.body;
            if (body == null)
                throw new errors.InvalidOperationError("Bodied node should have a body.");

            return this.getNodeFromCompilerNode(body);
        }

        setBodyText(textOrWriterFunction: string | WriterFunction) {
            const body = this.getBody();
            setBodyTextForNode(body, textOrWriterFunction);
            return this;
        }

        fill(structure: Partial<BodiedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.bodyText != null)
                this.setBodyText(structure.bodyText);

            return this;
        }
    };
}
