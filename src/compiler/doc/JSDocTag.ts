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
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.atToken, this.sourceFile) as Node;
    }

    /**
     * Gets the tag name node.
     */
    getTagNameNode() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.tagName, this.sourceFile) as Identifier;
    }

    /**
     * Gets the tag's comment.
     */
    getComment() {
        return this.compilerNode.comment;
    }
}
