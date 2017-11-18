import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {Node} from "./../common";

export type LiteralLikeNodeExtensionType = Node<ts.LiteralLikeNode>;

export interface LiteralLikeNode {
    /**
     * Gets if the literal is terminated.
     */
    isTerminated(): boolean;
    /**
     * Gets if the literal has an extended unicode escape.
     */
    hasExtendedUnicodeEscape(): boolean;
}

export function LiteralLikeNode<T extends Constructor<LiteralLikeNodeExtensionType>>(Base: T): Constructor<LiteralLikeNode> & T {
    return class extends Base implements LiteralLikeNode {
        isTerminated() {
            // I'm sorry, but this should not be a negative
            return !(this.compilerNode.isUnterminated || false);
        }

        hasExtendedUnicodeEscape() {
            return this.compilerNode.hasExtendedUnicodeEscape || false;
        }
    };
}
