import { ArrayUtils, errors, StringUtils, ts } from "@ts-morph/common";
import { getNodesToReturn, insertIntoParentTextRange, removeChildren, replaceTextPossiblyCreatingChildNodes, verifyAndGetIndex } from "../../../manipulation";
import { getPreviousMatchingPos } from "../../../manipulation/textSeek";
import { JSDocSpecificStructure, JSDocStructure, JSDocTagStructure, OptionalKind, StructureKind } from "../../../structures";
import { WriterFunction } from "../../../types";
import { CharCodes, getTextFromStringOrWriter } from "../../../utils";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { JSDocTag } from "./JSDocTag";
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

    /** Gets the comment property. Use `#getCommentText()` to get the text of the JS doc comment if necessary. */
    getComment() {
        if (this.compilerNode.comment == null)
            return undefined;
        else if (typeof this.compilerNode.comment === "string")
            return this.compilerNode.comment;
        else
            return this.compilerNode.comment.map(n => this._getNodeFromCompilerNodeIfExists(n));
    }

    /** Gets the text of the JS doc comment. */
    getCommentText() {
        if (typeof this.compilerNode.comment === "string")
            return this.compilerNode.comment;
        else
            return ts.getTextOfJSDocComment(this.compilerNode.comment);
    }

    /**
     * Gets the description from the JS doc comment.
     * @remarks This will contain a leading newline if the jsdoc is multi-line.
     */
    getDescription() {
        const sourceFileText = this.getSourceFile().getFullText();
        const endSearchStart = this.getTags()[0]?.getStart() ?? this.getEnd() - 2; // -2 for star slash
        const start = getStart(this);

        return getTextWithoutStars(sourceFileText.substring(start, Math.max(start, getEndPos())));

        function getStart(jsDoc: JSDoc) {
            const startOrSpacePos = jsDoc.getStart() + 3; // +3 for slash star star
            if (sourceFileText.charCodeAt(startOrSpacePos) === CharCodes.SPACE)
                return startOrSpacePos + 1;
            return startOrSpacePos;
        }

        function getEndPos() {
            const endOrNewLinePos = getPreviousMatchingPos(
                sourceFileText,
                endSearchStart,
                charCode => charCode === CharCodes.NEWLINE || !StringUtils.isWhitespaceCharCode(charCode) && charCode !== CharCodes.ASTERISK,
            );

            return getPreviousMatchingPos(
                sourceFileText,
                endOrNewLinePos,
                charCode => charCode !== CharCodes.NEWLINE && charCode !== CharCodes.CARRIAGE_RETURN,
            );
        }
    }

    /**
     * Sets the description.
     * @param textOrWriterFunction - Text or writer function to set.
     */
    setDescription(textOrWriterFunction: string | WriterFunction) {
        const tags = this.getTags();
        const startEditPos = this.getStart() + 3;
        const endEditPos = tags.length > 0
            ? getPreviousMatchingPos(this._sourceFile.getFullText(), tags[0].getStart(), c => c === CharCodes.ASTERISK) - 1
            : this.getEnd() - 2;

        replaceTextPossiblyCreatingChildNodes({
            parent: this,
            newText: getNewText.call(this),
            replacePos: startEditPos,
            replacingLength: endEditPos - startEditPos,
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
     * Adds a JS doc tag.
     * @param structure - Tag structure to add.
     */
    addTag(structure: OptionalKind<JSDocTagStructure>) {
        return this.addTags([structure])[0];
    }

    /**
     * Adds JS doc tags.
     * @param structures - Tag structures to add.
     */
    addTags(structures: ReadonlyArray<OptionalKind<JSDocTagStructure>>) {
        return this.insertTags(this.compilerNode.tags?.length ?? 0, structures);
    }

    /**
     * Inserts a JS doc tag at the specified index.
     * @param index - Index to insert at.
     * @param structure - Tag structure to insert.
     */
    insertTag(index: number, structure: OptionalKind<JSDocTagStructure>) {
        return this.insertTags(index, [structure])[0];
    }

    /**
     * Inserts JS doc tags at the specified index.
     * @param index - Index to insert at.
     * @param structures - Tag structures to insert.
     */
    insertTags(index: number, structures: ReadonlyArray<OptionalKind<JSDocTagStructure>>) {
        if (ArrayUtils.isNullOrEmpty(structures))
            return [];

        const writer = this._getWriterWithQueuedIndentation();
        const tags = this.getTags();
        index = verifyAndGetIndex(index, tags.length);

        if (tags.length === 0 && !this.isMultiLine()) {
            const structurePrinter = this._context.structurePrinterFactory.forJSDoc();
            this.replaceWithText(writer => {
                structurePrinter.printText(writer, {
                    description: this.getDescription(),
                    tags: structures as OptionalKind<JSDocTagStructure>[],
                });
            });
        }
        else {
            const structurePrinter = this._context.structurePrinterFactory.forJSDocTag({ printStarsOnNewLine: true });

            writer.newLine().write(" * ");
            structurePrinter.printTexts(writer, structures);
            writer.newLine().write(" *");
            writer.conditionalWrite(index < tags.length, " ");

            const replaceStart = getReplaceStart.call(this);
            const replaceEnd = getReplaceEnd.call(this);

            insertIntoParentTextRange({
                parent: this,
                insertPos: replaceStart,
                replacing: { textLength: replaceEnd - replaceStart },
                newText: writer.toString(),
            });
        }

        return getNodesToReturn(tags, this.getTags(), index, false);

        function getReplaceStart(this: JSDoc) {
            const searchStart = index < tags.length ? tags[index].getStart() : this.getEnd() - 2; // -2 for star slash
            const maxMin = this.getStart() + 3; // +3 for star star slash
            return Math.max(maxMin, getPreviousMatchingPos(
                this.getSourceFile().getFullText(),
                searchStart,
                charCode => !StringUtils.isWhitespaceCharCode(charCode) && charCode !== CharCodes.ASTERISK,
            ));
        }

        function getReplaceEnd(this: JSDoc) {
            if (index < tags.length)
                return tags[index].getStart();
            return this.getEnd() - 1; // -1 is for slash
        }
    }

    /**
     * Removes this JSDoc.
     */
    remove() {
        removeChildren({
            children: [this],
            removeFollowingSpaces: true,
            removeFollowingNewLines: true,
        });
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<JSDocStructure>) {
        callBaseSet(JSDocBase.prototype, this, structure);

        if (structure.tags != null) {
            return this.replaceWithText(writer => {
                this._context.structurePrinterFactory.forJSDoc().printText(writer, {
                    description: structure.description ?? this.getDescription(),
                    tags: structure.tags,
                });
            });
        }
        else if (structure.description != null) {
            this.setDescription(structure.description);
        }

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JSDocStructure {
        return callBaseGetStructure<JSDocSpecificStructure>(JSDocBase.prototype, this, {
            kind: StructureKind.JSDoc,
            description: this.getDescription(),
            tags: this.getTags().map(t => t.getStructure()),
        });
    }
}
