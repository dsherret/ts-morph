import {ts} from "./../../typescript";
import CodeBlockWriter from "code-block-writer";
import {verifyAndGetIndex, getIndentedText, getInsertPosFromIndex, insertIntoParentTextRange} from "./../../manipulation";
import {TypeGuards, StringUtils} from "./../../utils";
import * as errors from "./../../errors";
import {Node} from "./Node";

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
    addChildText(writer: (writer: CodeBlockWriter) => void): Node[];
    /**
     * @internal
     */
    addChildText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)): Node[];
    addChildText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
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
    insertChildText(index: number, writer: (writer: CodeBlockWriter) => void): Node[];
    /**
     * @internal
     */
    insertChildText(index: number, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)): Node[];
    insertChildText(index: number, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
        // get index
        const initialChildCount = this.getChildCount();
        const newLineKind = this.global.manipulationSettings.getNewLineKindAsString();
        const parent = this.getParentOrThrow();
        index = verifyAndGetIndex(index, initialChildCount);

        // get text
        let insertText = getIndentedText({
            textOrWriterFunction,
            manipulationSettings: this.global.manipulationSettings,
            indentationText: parent.getChildIndentationText()
        });

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
        return finalChildren.slice(index, index + finalChildren.length - initialChildCount);
    }
}
