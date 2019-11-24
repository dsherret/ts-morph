import { errors, SyntaxKind } from "@ts-morph/common";
import { insertIntoParentTextRange } from "../../../manipulation";
import { Constructor, WriterFunction } from "../../../types";
import { getTextFromStringOrWriter } from "../../../utils";
import { Node } from "../common";

export type TextInsertableNodeExtensionType = Node;

export interface TextInsertableNode {
    /**
     * Inserts text within the body of the node.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param pos - Position to insert at.
     * @param textOrWriterFunction - Text to insert.
     */
    insertText(pos: number, textOrWriterFunction: string | WriterFunction): this;
    /**
     * Replaces text within the body of the node.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param range - Start and end position of the text to replace.
     * @param textOrWriterFunction - Text to replace the range with.
     */
    replaceText(range: [number, number], textOrWriterFunction: string | WriterFunction): this;
    /**
     * Removes all the text within the node
     */
    removeText(): this;
    /**
     * Removes text within the body of the node.
     *
     * WARNING: This will forget any previously navigated descendant nodes.
     * @param pos - Start position to remove.
     * @param end - End position to remove.
     */
    removeText(pos: number, end: number): this;
}

export function TextInsertableNode<T extends Constructor<TextInsertableNodeExtensionType>>(Base: T): Constructor<TextInsertableNode> & T {
    return class extends Base implements TextInsertableNode {
        insertText(pos: number, textOrWriterFunction: string | WriterFunction) {
            this.replaceText([pos, pos], textOrWriterFunction);
            return this;
        }

        removeText(pos?: number, end?: number) {
            if (pos == null)
                this.replaceText(getValidRange(this), "");
            else
                this.replaceText([pos, end!], "");
            return this;
        }

        replaceText(range: [number, number], textOrWriterFunction: string | WriterFunction) {
            const childSyntaxList = this.getChildSyntaxListOrThrow();
            const validRange = getValidRange(this);
            const pos = range[0];
            const end = range[1];

            verifyArguments();

            // ideally this wouldn't replace the existing syntax list
            insertIntoParentTextRange({
                insertPos: pos,
                newText: getTextFromStringOrWriter(this._getWriter(), textOrWriterFunction),
                parent: childSyntaxList.getParentOrThrow(),
                replacing: {
                    textLength: end - pos,
                    nodes: [childSyntaxList]
                }
            });

            return this;

            function verifyArguments() {
                verifyInRange(pos);
                verifyInRange(end);

                if (pos > end)
                    throw new errors.ArgumentError(nameof(range), "Cannot specify a start position greater than the end position.");
            }

            function verifyInRange(i: number) {
                if (i >= validRange[0] && i <= validRange[1])
                    return;

                throw new errors.InvalidOperationError(`Cannot insert or replace text outside the bounds of the node. `
                    + `Expected a position between [${validRange[0]}, ${validRange[1]}], but received ${i}.`);
            }
        }
    };
}

function getValidRange(thisNode: Node): [number, number] {
    const rangeNode = getRangeNode();
    const openBrace = Node.isSourceFile(rangeNode) ? undefined : rangeNode.getPreviousSiblingIfKind(SyntaxKind.OpenBraceToken);
    const closeBrace = openBrace == null ? undefined : rangeNode.getNextSiblingIfKind(SyntaxKind.CloseBraceToken);
    if (openBrace != null && closeBrace != null)
        return [openBrace.getEnd(), closeBrace.getStart()];
    else
        return [rangeNode.getPos(), rangeNode.getEnd()];

    function getRangeNode() {
        if (Node.isSourceFile(thisNode))
            return thisNode;
        return thisNode.getChildSyntaxListOrThrow();
    }
}
