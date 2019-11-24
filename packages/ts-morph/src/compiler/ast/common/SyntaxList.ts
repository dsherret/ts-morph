import { ts } from "@ts-morph/common";
import { getInsertPosFromIndex, getNodesToReturn, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { WriterFunction } from "../../../types";
import { getTextFromStringOrWriter } from "../../../utils";
import { Node } from "./Node";

export class SyntaxList extends Node<ts.SyntaxList> {
    /**
     * Adds text at the end of the current children.
     * @param textOrWriterFunction - Text to add or function that provides a writer to write with.
     * @returns The children that were added.
     */
    addChildText(textOrWriterFunction: string | WriterFunction | ReadonlyArray<string | WriterFunction>) {
        return this.insertChildText(this.getChildCount(), textOrWriterFunction);
    }

    /**
     * Inserts text at the specified child index.
     * @param index - Child index to insert at.
     * @param textOrWriterFunction - Text to insert or function that provides a writer to write with.
     * @returns The children that were inserted.
     */
    insertChildText(index: number, textOrWriterFunction: string | WriterFunction | ReadonlyArray<string | WriterFunction>) {
        // get index
        const initialChildCount = this.getChildCount();
        const newLineKind = this._context.manipulationSettings.getNewLineKindAsString();
        const parent = this.getParentOrThrow();
        index = verifyAndGetIndex(index, initialChildCount);

        // get text
        const isInline = this !== parent.getChildSyntaxList();
        let insertText = getTextFromStringOrWriter(
            isInline ? parent._getWriterWithQueuedChildIndentation() : parent._getWriterWithChildIndentation(),
            textOrWriterFunction
        );

        if (insertText.length === 0)
            return [];

        if (isInline) {
            if (index === 0)
                insertText += " ";
            else
                insertText = " " + insertText;
        }
        else {
            if (index === 0 && Node.isSourceFile(parent)) {
                if (!insertText.endsWith("\n"))
                    insertText += newLineKind;
            }
            else {
                insertText = newLineKind + insertText;

                // remove the last newline if inserting to the end of a node that's not a source file
                if (!Node.isSourceFile(parent) && index === initialChildCount && insertText.endsWith("\n"))
                    insertText = insertText.replace(/\r?\n$/, "");
            }
        }

        // insert
        const insertPos = getInsertPosFromIndex(index, this, this.getChildren());
        insertIntoParentTextRange({
            insertPos,
            newText: insertText,
            parent: this
        });

        // get inserted children
        const finalChildren = this.getChildren();
        return getNodesToReturn(initialChildCount, finalChildren, index, true);
    }
}
