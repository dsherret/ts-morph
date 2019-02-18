import { ts } from "../../../typescript";
import { Identifier, Node } from "../common";

/**
 * JS doc tag node.
 */
export class JSDocTag<NodeType extends ts.JSDocTag = ts.JSDocTag> extends Node<NodeType> {
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
}
