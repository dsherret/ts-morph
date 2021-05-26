import { StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { getPreviousMatchingPos, insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { JSDocTagSpecificStructure, JSDocTagStructure, StructureKind } from "../../../structures";
import { WriterFunction } from "../../../types";
import { CharCodes, getTextFromStringOrWriter } from "../../../utils";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { Identifier } from "../name";
import { getTextWithoutStars } from "./utils/getTextWithoutStars";

export const JSDocTagBase = Node;
/**
 * JS doc tag node.
 */
export class JSDocTag<NodeType extends ts.JSDocTag = ts.JSDocTag> extends JSDocTagBase<NodeType> {
    /**
     * Gets the tag's name as a string (ex. returns `"param"` for `&#64;param`).
     */
    getTagName() {
        return this.getTagNameNode().getText();
    }

    /**
     * Gets the tag name node (ex. Returns the `param` identifier for `&#64;param`).
     */
    getTagNameNode(): Identifier {
        return this._getNodeFromCompilerNode(this.compilerNode.tagName);
    }

    /**
     * Sets the tag name.
     * @param tagName - The new name to use.
     * @returns The current node or new node if the node kind changed.
     * @remarks This will forget the current node if the JSDocTag kind changes. Use the return value if you're changing the kind.
     */
    setTagName(tagName: string) {
        return this.set({ tagName });
    }

    /** Gets the tag's comment property. Use `#getCommentText()` to get the text of the JS doc tag comment if necessary. */
    getComment() {
        if (this.compilerNode.comment == null)
            return undefined;
        else if (typeof this.compilerNode.comment === "string")
            return this.compilerNode.comment;
        else
            return this.compilerNode.comment.map(n => this._getNodeFromCompilerNodeIfExists(n));
    }

    /** Gets the text of the JS doc tag comment (ex. `"Some description."` for `&#64;param value Some description.`). */
    getCommentText() {
        if (typeof this.compilerNode.comment === "string")
            return this.compilerNode.comment;
        else
            return ts.getTextOfJSDocComment(this.compilerNode.comment);
    }

    /** Removes the JS doc comment. */
    remove() {
        const jsDocBodyStart = this.getParentOrThrow().getStart() + 3; // +3 for slash star star
        const nextJsDocTag = getNextJsDocTag(this);
        const isLastJsDoc = nextJsDocTag == null;
        const removalStart = getRemovalStart.call(this);

        removeChildren({
            children: [this],
            customRemovalPos: removalStart,
            customRemovalEnd: getNextTagStartOrDocEnd(this, nextJsDocTag),
            replaceTrivia: getReplaceTrivia.call(this),
        });

        function getRemovalStart(this: JSDocTag) {
            return Math.max(jsDocBodyStart, getPreviousNonWhiteSpacePos(this, this.getStart()));
        }

        function getReplaceTrivia(this: JSDocTag) {
            if (removalStart === jsDocBodyStart && isLastJsDoc)
                return "";

            const newLineKind = this._context.manipulationSettings.getNewLineKindAsString();
            const indentationText = this.getParentOrThrow().getIndentationText();
            return `${newLineKind}${indentationText} ` + (isLastJsDoc ? "" : "* ");
        }
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     * @returns The node or the node that replaced the existing node (ex. when changing from a JSDocParameterTag to something else).
     */
    set(structure: Partial<JSDocTagStructure>) {
        callBaseSet(JSDocTagBase.prototype, this, structure);

        if (structure.text != null || structure.tagName != null) {
            // replace everything as changing the tag name or text may change the type
            return this.replaceWithText(writer => {
                this._context.structurePrinterFactory.forJSDocTag({ printStarsOnNewLine: true }).printText(writer, {
                    tagName: structure.tagName ?? this.getTagName(),
                    text: structure.text != null ? structure.text : getText(this),
                });
            });
        }

        return this;
    }

    /** @inheritdoc */
    replaceWithText(textOrWriterFunction: string | WriterFunction): Node {
        // this needs to be custom implemented because of TS issue #35455 where JSDoc start and end widths are wrong
        const newText = getTextFromStringOrWriter(this._getWriterWithQueuedIndentation(), textOrWriterFunction);
        const parent = this.getParentOrThrow();
        const childIndex = this.getChildIndex();

        const start = this.getStart();
        insertIntoParentTextRange({
            parent,
            insertPos: start,
            newText,
            replacing: {
                textLength: getTagEnd(this) - start,
            },
        });

        return parent.getChildren()[childIndex];
    }

    /**
     * Gets a structure that represents this JS doc tag node.
     */
    getStructure(): JSDocTagStructure {
        const text = getText(this);
        return callBaseGetStructure<JSDocTagSpecificStructure>(JSDocTagBase.prototype, this, {
            kind: StructureKind.JSDocTag,
            tagName: this.getTagName(),
            text: text.length === 0 ? undefined : text,
        });
    }
}

function getText(jsDocTag: JSDocTag) {
    const text = jsDocTag.getSourceFile().getFullText();
    const nameEnd = jsDocTag.getTagNameNode().getEnd();
    const tagEnd = getTagEnd(jsDocTag);
    const startPos = Math.min(text.charCodeAt(nameEnd) === CharCodes.SPACE ? nameEnd + 1 : nameEnd, tagEnd);
    return getTextWithoutStars(text.substring(startPos, tagEnd));
}

function getTagEnd(jsDocTag: JSDocTag) {
    return getPreviousNonWhiteSpacePos(jsDocTag, getNextTagStartOrDocEnd(jsDocTag));
}

function getNextTagStartOrDocEnd(jsDocTag: JSDocTag, nextJsDocTag?: JSDocTag) {
    // JSDocTag#getEnd() is inconsistent (TS issue #35455)
    nextJsDocTag = nextJsDocTag ?? getNextJsDocTag(jsDocTag);

    return nextJsDocTag != null
        ? nextJsDocTag.getStart()
        : jsDocTag.getParentOrThrow().getEnd() - 2; // -2 for star slash
}

function getNextJsDocTag(jsDocTag: JSDocTag): JSDocTag | undefined {
    const parent = jsDocTag.getParentIfKindOrThrow(SyntaxKind.JSDocComment);
    const tags = parent.getTags();
    const thisIndex = tags.indexOf(jsDocTag);
    return tags[thisIndex + 1];
}

function getPreviousNonWhiteSpacePos(jsDocTag: JSDocTag, pos: number) {
    const sourceFileText = jsDocTag.getSourceFile().getFullText();

    return getPreviousMatchingPos(sourceFileText, pos, charCode => charCode !== CharCodes.ASTERISK && !StringUtils.isWhitespaceCharCode(charCode));
}
