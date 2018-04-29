import { ts } from "../../typescript";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { removeChildren, replaceTextPossiblyCreatingChildNodes } from "../../manipulation";
import { getPreviousMatchingPos } from "../../manipulation/textSeek";
import { getTextFromStringOrWriter } from "../../utils";
import { Node } from "../common";
import { JSDocTag } from "./JSDocTag";

/**
 * JS doc node.
 */
export class JSDoc extends Node<ts.JSDoc> {
    /**
     * Gets the tags of the JSDoc.
     */
    getTags(): JSDocTag[] {
        const tags = this.compilerNode.tags;
        if (tags == null)
            return [];
        return tags.map(t => this.getNodeFromCompilerNode<JSDocTag>(t));
    }

    /**
     * Gets the comment.
     */
    getComment() {
        return this.compilerNode.comment;
    }

    /**
     * Gets the JSDoc's text without the surrounding comment.
     */
    getInnerText() {
        const innerTextWithStars = this.getText().replace(/^\/\*\*[^\S\n]*\n?/, "").replace(/(\r?\n)?[^\S\n]*\*\/$/, "");

        return innerTextWithStars.split(/\n/).map(line => {
            const starPos = line.indexOf("*");
            if (starPos === -1)
                return line;
            const substringStart = line[starPos + 1] === " " ? starPos + 2 : starPos + 1;
            return line.substring(substringStart);
        }).join("\n");
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
        const newLineKind = this.global.manipulationSettings.getNewLineKindAsString();
        const text = getTextFromStringOrWriter(this.getWriter(), textOrWriterFunction);
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
