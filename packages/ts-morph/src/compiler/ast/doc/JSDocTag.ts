import { ts } from "@ts-morph/common";
import { Node } from "../common";
import { Identifier } from "../name";
import { JSDocTagStructure, JSDocTagSpecificStructure, StructureKind } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { getTextWithoutStars } from "./utils/getTextWithoutStars";

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

    /**
     * Gets the tag's comment.
     */
    getComment() {
        return this.compilerNode.comment;
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
            // a tag's end will go up to the next tag or end of the JS doc
            const trailingWhiteSpace = this.getText().substring(this.getText().trimRight().length); // todo: not performant
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
