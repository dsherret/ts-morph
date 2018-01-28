import * as ts from "typescript";
import CodeBlockWriter from "code-block-writer";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {BodyableNodeStructure} from "./../../structures";
import {Node} from "./../common";
import {callBaseFill} from "./../callBaseFill";
import {setBodyTextForNode} from "./helpers/setBodyTextForNode";

export type BodyableNodeExtensionType = Node<ts.Node & { body?: ts.Node; }>;

export interface BodyableNode {
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
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: (writer: CodeBlockWriter) => void): this;
    /**
     * Sets the body text. A body is required to do this operation.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
}

export function BodyableNode<T extends Constructor<BodyableNodeExtensionType>>(Base: T): Constructor<BodyableNode> & T {
    return class extends Base implements BodyableNode {
        getBodyOrThrow() {
            return errors.throwIfNullOrUndefined(this.getBody(), "A node body is required to do this operation.");
        }

        getBody() {
            return this.getNodeFromCompilerNodeIfExists(this.compilerNode.body);
        }

        setBodyText(writerFunction: (writer: CodeBlockWriter) => void): this;
        setBodyText(text: string): this;
        setBodyText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)): this;
        setBodyText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
            const body = this.getBodyOrThrow();
            setBodyTextForNode(body, textOrWriterFunction);
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
