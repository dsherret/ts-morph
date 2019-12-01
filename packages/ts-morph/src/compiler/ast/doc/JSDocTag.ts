import { ts, StringUtils } from "@ts-morph/common";
import { Node } from "../common";
import { Identifier } from "../name";
import { JSDocTagStructure, JSDocTagSpecificStructure, StructureKind } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { getTextWithoutStars } from "./utils/getTextWithoutStars";
import { removeChildren, getEndPosFromIndex } from "../../../manipulation";

export const JSDocTagBase = Node;
/**
 * JS doc tag node.
 */
export class JSDocTag<NodeType extends ts.JSDocTag = ts.JSDocTag> extends JSDocTagBase<NodeType> {
    /**
     * Gets the tag's name as a string.
     */
    getTagName() {
        return this.getTagNameNode().getText();
    }

    /**
     * Gets the tag name node.
     */
    getTagNameNode(): Identifier {
        return this._getNodeFromCompilerNode(this.compilerNode.tagName);
    }

    /** Gets the tag's comment. */
    getComment() {
        return this.compilerNode.comment;
    }

    /** Removes the JS doc comment. */
    remove() {
        const parent = this.getParentOrThrow();
        const jsDocBodyStart = this.getParentOrThrow().getStart() + 3; // +3 for slash star star
        const isLastJsDoc = this.getEnd() === parent.getEnd() - 2; // -2 for star slash
        const startPos = getStartPos.call(this);

        removeChildren({
            children: [this],
            customRemovalPos: startPos,
            replaceTrivia: getReplaceTrivia.call(this)
        });

        function getStartPos(this: JSDocTag) {
            const asteriskCharCode = "*".charCodeAt(0);
            const start = this.getStart();
            const sourceFileText = this.getSourceFile().getFullText();

            let lastPos = start;
            for (let i = start - 1; i >= jsDocBodyStart; i--) {
                const currentCharCode = sourceFileText.charCodeAt(i);
                if (currentCharCode !== asteriskCharCode && !StringUtils.isWhitespaceCharCode(currentCharCode))
                    break;
                lastPos = i;
            }
            return lastPos;
        }

        function getReplaceTrivia(this: JSDocTag) {
            if (startPos === jsDocBodyStart && isLastJsDoc)
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
            const writer = this.getParentOrThrow().getParentOrThrow()._getWriterWithQueuedIndentation();
            this._context.structurePrinterFactory.forJSDocTag({ printStarsOnNewLine: true }).printText(writer, {
                tagName: structure.tagName ?? this.getTagName(),
                text: structure.text != null ? structure.text : getText(this)
            });
            const trailingWhiteSpace = this.getSourceFile().getFullText().substring(getNonWhiteSpaceTagEnd(this), this.getEnd());
            return this.replaceWithText(writer.toString() + trailingWhiteSpace);
        }

        return this;
    }

    /**
     * Gets a structure that represents this JS doc tag node.
     */
    getStructure(): JSDocTagStructure {
        const text = getText(this);
        return callBaseGetStructure<JSDocTagSpecificStructure>(JSDocTagBase.prototype, this, {
            kind: StructureKind.JSDocTag,
            tagName: this.getTagName(),
            text: text.length === 0 ? undefined : text
        });
    }
}

function getText(jsDocTag: JSDocTag) {
    return getTextWithoutStars(jsDocTag.getSourceFile().getFullText().substring(jsDocTag.getTagNameNode().getEnd(), jsDocTag.getEnd()).trim());
}

function getNonWhiteSpaceTagEnd(jsDocTag: JSDocTag) {
    // a tag's end will go up to the next tag or end of the JS doc
    const sourceFileText = jsDocTag.getSourceFile().getFullText();
    const asteriskCharCode = "*".charCodeAt(0);
    for (let i = jsDocTag.getEnd(); i >= 0; i--) {
        const currentCharCode = sourceFileText.charCodeAt(i);
        if (currentCharCode !== asteriskCharCode && !StringUtils.isWhitespaceCharCode(currentCharCode))
            return i + 1;
    }
    return 0;
}
