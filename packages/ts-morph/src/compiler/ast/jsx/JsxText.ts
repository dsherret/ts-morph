import { ts } from "@ts-morph/common";
import { LiteralLikeNode } from "../base";
import { Node } from "../common";

export const JsxTextBase = LiteralLikeNode(Node);
export class JsxText extends JsxTextBase<ts.JsxText> {
    /**
     * Gets if the JSX text contains only white spaces.
     */
    containsOnlyTriviaWhiteSpaces() {
        // this is necessary for typescript < 3.4
        const oldCompilerNode = this.compilerNode as { containsOnlyWhiteSpaces?: boolean; };
        if (typeof oldCompilerNode.containsOnlyWhiteSpaces === "boolean")
            return oldCompilerNode.containsOnlyWhiteSpaces;

        return this.compilerNode.containsOnlyTriviaWhiteSpaces;
    }
}
