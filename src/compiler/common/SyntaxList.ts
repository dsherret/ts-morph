import { getInsertPosFromIndex, getNodesToReturn, insertIntoParentTextRange, verifyAndGetIndex } from "../../manipulation";
import { WriterFunction } from "../../types";
import { ts } from "../../typescript";
import { getTextFromStringOrWriter, StringUtils, TypeGuards } from "../../utils";
import { Node } from "./Node";

export class SyntaxList extends Node<ts.SyntaxList> {
    /**
     * Adds text at the end of the current children.
     * @param text - Text to insert.
     * @returns The children that were added.
     */
    addChildText(text: string): Node[];
    /**
     * Adds text at the end of the current children.
     * @param writer - Write the text using the provided writer.
     * @returns The children that were added.
     */
    addChildText(writer: WriterFunction): Node[];
    /**
     * @internal
     */
    addChildText(textOrWriterFunction: string | WriterFunction): Node[];
    addChildText(textOrWriterFunction: string | WriterFunction) {
        return this.insertChildText(this.getChildCount(), textOrWriterFunction);
    }

    /**
     * Inserts text at the specified child index.
     * @param index - Child index to insert at.
     * @param text - Text to insert.
     * @returns The children that were inserted.
     */
    insertChildText(index: number, text: string): Node[];
    /**
     * Inserts text at the specified child index.
     * @param index - Child index to insert at.
     * @param writer - Write the text using the provided writer.
     * @returns The children that were inserted.
     */
    insertChildText(index: number, writer: WriterFunction): Node[];
    /**
     * @internal
     */
    insertChildText(index: number, textOrWriterFunction: string | WriterFunction): Node[];
    insertChildText(index: number, textOrWriterFunction: string | WriterFunction) {
        // get index
        const initialChildCount = this.getChildCount();
        const newLineKind = this.global.manipulationSettings.getNewLineKindAsString();
        const parent = this.getParentOrThrow();
        index = verifyAndGetIndex(index, initialChildCount);

        // get text
        let insertText = getTextFromStringOrWriter(parent.getWriterWithChildIndentation(), textOrWriterFunction);

        if (insertText.length === 0)
            return [];

        if (index === 0 && TypeGuards.isSourceFile(parent)) {
            if (!StringUtils.endsWith(insertText, newLineKind))
                insertText += newLineKind;
        }
        else
            insertText = newLineKind + insertText;

        // insert
        const insertPos = getInsertPosFromIndex(index, parent, this.getChildren());
        insertIntoParentTextRange({
            insertPos,
            newText: insertText,
            parent: this
        });

        // get inserted children
        const finalChildren = this.getChildren();
        return getNodesToReturn(finalChildren, index, finalChildren.length - initialChildCount);
    }
}
