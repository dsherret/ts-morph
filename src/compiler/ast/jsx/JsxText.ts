import { ts } from "../../../typescript";
import { Node } from "../common";

export class JsxText extends Node<ts.JsxText> {
    /**
     * Gets if the JSX text contains only white spaces.
     */
    containsOnlyWhiteSpaces(): boolean {
        // containsOnlyWhiteSpaces was renamed to containsOnlyTriviaWhiteSpaces in ts 3.4
        const compilerNode = this.compilerNode as any; // any for laziness since this branch is not going to be maintained
        return compilerNode.containsOnlyWhiteSpaces || compilerNode.containsOnlyTriviaWhiteSpaces || false;
    }
}
