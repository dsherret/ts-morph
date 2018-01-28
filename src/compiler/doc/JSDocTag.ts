import * as ts from "typescript";
import {Node, Identifier} from "./../common";

/**
 * JS doc tag node.
 */
export class JSDocTag<NodeType extends ts.JSDocTag = ts.JSDocTag> extends Node<NodeType> {
    /**
     * Gets the at token.
     */
    getAtToken() {
        return this.getNodeFromCompilerNode<Node>(this.compilerNode.atToken);
    }

    /**
     * Gets the tag name node.
     */
    getTagNameNode() {
        return this.getNodeFromCompilerNode<Identifier>(this.compilerNode.tagName);
    }

    /**
     * Gets the tag's comment.
     */
    getComment() {
        return this.compilerNode.comment;
    }
}
