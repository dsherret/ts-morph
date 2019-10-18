import { ts } from "@ts-morph/common";
import { Constructor } from "../../../types";
import { Node } from "../common";

export type LiteralLikeNodeExtensionType = Node<ts.LiteralLikeNode>;

export interface LiteralLikeNode {
    /**
     * Get text of the literal.
     */
    getLiteralText(): string;
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
        getLiteralText() {
            return this.compilerNode.text;
        }

        isTerminated() {
            // I'm sorry, but this should not be a negative
            return !(this.compilerNode.isUnterminated || false);
        }

        hasExtendedUnicodeEscape() {
            return this.compilerNode.hasExtendedUnicodeEscape || false;
        }
    };
}
