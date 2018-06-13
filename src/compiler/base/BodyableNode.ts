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

        getStructure(): BodyableNodeStructure {
            // Extract body text without breaking current statement indentation:
            // Get the statements within the body and then get the text within the source file from
            // statements[0].getNonWhitespaceStart() to statements[statements.length - 1].getTrailingTriviaEnd().
            // Then remove the leading spaces from every line (so remove statements[0].getIndentationText() from every line
            const body = this.getBody();
            let bodyText: string|undefined = undefined;
            if (body) {
                const statements = body.getDescendantStatements();
                if (!statements.length) {
                    bodyText = "";
                }
                else {
                    const leadingSpacesLength = statements[0].getIndentationText().length;
                    bodyText = this.sourceFile.getFullText()
                        .substring(statements[0].getNonWhitespaceStart(), statements[statements.length - 1].getTrailingTriviaEnd())
                        .split(this.global.manipulationSettings.getNewLineKindAsString())
                        .map((line, index) => index !== 0 ? line.substring(leadingSpacesLength - 1, line.length) : line)
                        .join(this.global.manipulationSettings.getNewLineKindAsString());
                }
            }
            return callBaseGetStructure<BodyableNodeStructure>(Base.prototype, this, {
                bodyText
            });
        }
    };
}
