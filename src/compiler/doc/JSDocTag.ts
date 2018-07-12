import { ts } from "../../typescript";
import { Identifier, Node } from "../common";

/**
 * JS doc tag node.
 */
export class JSDocTag<NodeType extends ts.JSDocTag = ts.JSDocTag> extends Node<NodeType> {
    /**
     * Gets the at token.
     */
    getAtToken(): Node {
        return this.getNodeFromCompilerNode(this.compilerNode.atToken);
    }

    /**
     * Gets the tag's name as a string.
     */
    getName() {
        return this.getTagNameNode().getText();
    }

    /**
     * Gets the tag name node.
     */
    getTagNameNode(): Identifier {
        return this.getNodeFromCompilerNode(this.compilerNode.tagName);
    }

    /**
     * Gets the tag's comment.
     */
    getComment() {
        return this.compilerNode.comment;
    }
}
