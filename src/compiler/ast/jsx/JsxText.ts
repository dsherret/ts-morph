import { ts } from "../../../typescript";
import { LiteralLikeNode } from "../base";
import { Node } from "../common";

export class JsxText extends LiteralLikeNode(Node)<ts.JsxText> {
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
