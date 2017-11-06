import * as ts from "typescript";
import CodeBlockWriter from "code-block-writer";
import {removeChildren, replaceTextPossiblyCreatingChildNodes} from "./../../manipulation";
import {getPreviousMatchingPos} from "./../../manipulation/textSeek";
import {getTextFromStringOrWriter} from "./../../utils";
import {Node} from "./../common";

/**
 * JS doc node.
 */
export class JSDoc extends Node<ts.JSDoc> {
    /**
     * Gets the tags of the JSDoc.
     */
    getTags(): Node[] {
        const tags = this.compilerNode.tags;
        if (tags == null)
            return [];
        return tags.map(t => this.global.compilerFactory.getNodeFromCompilerNode(t, this.sourceFile)) as Node[];
    }

    /**
     * Gets the comment.
     */
    getComment() {
        return this.compilerNode.comment;
    }

    /**
     * Sets the comment.
     * @param writerFunction - Write the text using the provided writer.
     */
    setComment(writerFunction: (writer: CodeBlockWriter) => void): this;
    /**
     * Sets the comment.
     * @param text - Text of the comment.
     */
    setComment(text: string): this;
    setComment(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
        const tags = this.getTags();
        const startEditPos = this.getStart() + 3;
        const endEditPos = tags.length > 0 ? getPreviousMatchingPos(this.sourceFile.getFullText(), tags[0].getStart(), c => c === "*") - 1 : this.getEnd() - 2;
        const indentationText = this.getIndentationText();
        const newLineKind = this.global.manipulationSettings.getNewLineKind();
        const text = getTextFromStringOrWriter(this.global.manipulationSettings, textOrWriterFunction);
        const newText = newLineKind + text.split(/\r?\n/).map(l => `${indentationText} * ${l}`).join(newLineKind) + newLineKind + indentationText + " ";

        replaceTextPossiblyCreatingChildNodes({
            parent: this,
            newText,
            replacePos: startEditPos,
            replacingLength: endEditPos - startEditPos
        });

        return this;
    }

    /**
     * Removes this JSDoc.
     */
    remove() {
        removeChildren({
            children: [this],
            removeFollowingSpaces: true,
            removeFollowingNewLines: true
        });
    }
}
