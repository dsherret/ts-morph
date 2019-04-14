import { removeChildren, replaceTextPossiblyCreatingChildNodes } from "../../../manipulation";
import { getPreviousMatchingPos } from "../../../manipulation/textSeek";
import { WriterFunction } from "../../../types";
import { ts } from "../../../typescript";
import { getTextFromStringOrWriter } from "../../../utils";
import { Node } from "../common";
import { JSDocTag } from "./JSDocTag";
import { JSDocStructure, JSDocSpecificStructure } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";

export const JSDocBase = Node;
/**
 * JS doc node.
 */
export class JSDoc extends JSDocBase<ts.JSDoc> {
    /**
     * Gets the tags of the JSDoc.
     */
    getTags(): JSDocTag[] {
        const tags = this.compilerNode.tags;
        if (tags == null)
            return [];
        return tags.map(t => this._getNodeFromCompilerNode(t));
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
     * @param textOrWriterFunction - Text or writer function to set.
     */
    setComment(textOrWriterFunction: string | WriterFunction) {
        const tags = this.getTags();
        const startEditPos = this.getStart() + 3;
        const endEditPos = tags.length > 0 ? getPreviousMatchingPos(this._sourceFile.getFullText(), tags[0].getStart(), c => c === "*") - 1 : this.getEnd() - 2;
        const indentationText = this.getIndentationText();
        const newLineKind = this._context.manipulationSettings.getNewLineKindAsString();
        const text = getTextFromStringOrWriter(this._getWriter(), textOrWriterFunction);
        const lines = text.split(/\r?\n/).map(l => l.length === 0 ? `${indentationText} *` : `${indentationText} * ${l}`).join(newLineKind);
        const newText = newLineKind + lines  + newLineKind + indentationText + " ";

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

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<JSDocStructure>) {
        callBaseSet(JSDocBase.prototype, this, structure);

        if (structure.description != null)
            this.setComment(structure.description);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JSDocStructure {
        return callBaseGetStructure<JSDocSpecificStructure>(JSDocBase.prototype, this, {
            description: this.getInnerText() // good enough for now
        });
    }
}
