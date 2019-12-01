import { StringUtils, ts, errors } from "@ts-morph/common";
import { removeChildren, replaceTextPossiblyCreatingChildNodes } from "../../../manipulation";
import { getPreviousMatchingPos } from "../../../manipulation/textSeek";
import { WriterFunction } from "../../../types";
import { getTextFromStringOrWriter } from "../../../utils";
import { Node } from "../common";
import { JSDocTag } from "./JSDocTag";
import { JSDocStructure, JSDocSpecificStructure, StructureKind } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { getTextWithoutStars } from "./utils/getTextWithoutStars";

export const JSDocBase = Node;
/**
 * JS doc node.
 */
export class JSDoc extends JSDocBase<ts.JSDoc> {
    /**
     * Gets if this JS doc spans multiple lines.
     */
    isMultiLine() {
        return this.getText().includes("\n");
    }

    /**
     * Gets the tags of the JSDoc.
     */
    getTags(): JSDocTag[] {
        return this.compilerNode.tags?.map(t => this._getNodeFromCompilerNode(t)) ?? [];
    }

    /**
     * Gets the JSDoc's text without the surrounding slashes and stars.
     */
    getInnerText() {
        return getTextWithoutStars(this.getText());
    }

    /**
     * Gets the description from the JS doc comment.
     * @remarks This will contain a leading newline if the jsdoc is multi-line.
     */
    getDescription() {
        const description = this.compilerNode.comment ?? "";

        // If the jsdoc text is like /**\n * Some description.\n*/ then force its
        // description to start with a newline so that ts-morph will later make this multi-line.
        if (this.isMultiLine() && !description.includes("\n"))
            return this._context.manipulationSettings.getNewLineKindAsString() + description;
        else
            return description;
    }

    /**
     * Sets the description.
     * @param textOrWriterFunction - Text or writer function to set.
     */
    setDescription(textOrWriterFunction: string | WriterFunction) {
        const tags = this.getTags();
        const startEditPos = this.getStart() + 3;
        const endEditPos = tags.length > 0
            ? getPreviousMatchingPos(this._sourceFile.getFullText(), tags[0].getStart(), c => c === "*") - 1
            : this.getEnd() - 2;

        replaceTextPossiblyCreatingChildNodes({
            parent: this,
            newText: getNewText.call(this),
            replacePos: startEditPos,
            replacingLength: endEditPos - startEditPos
        });

        return this;

        function getNewText(this: JSDoc) {
            const indentationText = this.getIndentationText();
            const newLineKind = this._context.manipulationSettings.getNewLineKindAsString();
            const rawLines = getTextFromStringOrWriter(this._getWriter(), textOrWriterFunction).split(/\r?\n/);
            const startsWithNewLine = rawLines[0].length === 0;
            const isSingleLine = rawLines.length === 1 && (this.compilerNode.tags?.length ?? 0) === 0;
            const linesText = isSingleLine ? rawLines[0] : rawLines.map(l => l.length === 0 ? `${indentationText} *` : `${indentationText} * ${l}`)
                .slice(startsWithNewLine ? 1 : 0)
                .join(newLineKind);

            // add the final spacing
            return isSingleLine ? " " + linesText + " " : newLineKind + linesText + newLineKind + indentationText + " ";
        }
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
            this.setDescription(structure.description);
        if (structure.tags != null)
            throw new errors.NotImplementedError("Setting JS doc tags has not been implemented yet.");

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JSDocStructure {
        return callBaseGetStructure<JSDocSpecificStructure>(JSDocBase.prototype, this, {
            kind: StructureKind.JSDoc,
            description: this.getDescription(),
            tags: this.getTags().map(t => t.getStructure())
        });
    }
}
