import * as errors from "../../errors";
import { insertIntoParentTextRange } from "../../manipulation";
import { BodyableNodeStructure } from "../../structures";
import { Constructor, WriterFunction } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { callBaseFill } from "../callBaseFill";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { Node } from "../common/Node";
import { setBodyTextForNode } from "./helpers/setBodyTextForNode";

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
     * Gets if the node has a body.
     */
    hasBody(): boolean;
    /**
     * Sets the body text. A body is required to do this operation.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: WriterFunction): this;
    /**
     * Sets the body text. A body is required to do this operation.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
    /**
     * Adds a body if it doesn't exists.
     */
    addBody(): this;
    /**
     * Removes the body if it exists.
     */
    removeBody(): this;
}

export function BodyableNode<T extends Constructor<BodyableNodeExtensionType>>(Base: T): Constructor<BodyableNode> & T {
    return class extends Base implements BodyableNode {
        getBodyOrThrow() {
            return errors.throwIfNullOrUndefined(this.getBody(), "Expected to find the node's body.");
        }

        getBody() {
            return this.getNodeFromCompilerNodeIfExists(this.compilerNode.body);
        }

        setBodyText(textOrWriterFunction: string | WriterFunction) {
            this.addBody();
            setBodyTextForNode(this.getBodyOrThrow(), textOrWriterFunction);
            return this;
        }

        hasBody() {
            return this.compilerNode.body != null;
        }

        addBody() {
            if (this.hasBody())
                return this;

            const semiColon = this.getLastChildByKind(SyntaxKind.SemicolonToken);

            insertIntoParentTextRange({
                parent: this,
                insertPos: semiColon == null ? this.getEnd() : semiColon.getStart(),
                newText: this.getWriterWithQueuedIndentation().block().toString(),
                replacing: {
                    textLength: semiColon == null ? 0 : semiColon.getFullWidth()
                }
            });

            return this;
        }

        removeBody() {
            const body = this.getBody();
            if (body == null)
                return this;

            insertIntoParentTextRange({
                parent: this,
                insertPos: body.getPos(),
                newText: ";",
                replacing: {
                    textLength: body.getFullWidth()
                }
            });

            return this;
        }

        fill(structure: Partial<BodyableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.bodyText != null)
                this.setBodyText(structure.bodyText);

            return this;
        }

        getStructure() {
            // TODO: This complication is because we need to remove body text wrapping braces.
            // If not they will be duplicated when printing a functiondeclaration and others, not sure why. Investigate.

            const body = this.getBody();
            const structure: MakeRequired<BodyableNodeStructure> = { bodyText: undefined };
            if (body) {
                const openBrace = body.getFirstChildByKind(SyntaxKind.OpenBraceToken);
                const closeBrace = body.getFirstChildByKind(SyntaxKind.CloseBraceToken);
                if (!openBrace || !closeBrace) {
                    structure.bodyText = body.getText();
                }
                else {
                    structure.bodyText = body.getText().trim();
                    structure.bodyText = structure.bodyText.substring(1, structure.bodyText.length - 1);
                }
            }
            return callBaseGetStructure<BodyableNodeStructure>(Base.prototype, this, structure);

            // TODO: if it were not because of this issue then it should be as easy as :
            // return callBaseGetStructure<BodyableNodeStructure>(Base.prototype, this, {
            //     bodyText: body ? body.getText() : undefined
            // });
        }
    };
}
