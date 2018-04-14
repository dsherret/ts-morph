import { ts } from "../../typescript";
import { Node } from "../common";

export class JsxText extends Node<ts.JsxText> {
    /**
     * Gets if the JSX text contains only white spaces.
     */
    containsOnlyWhiteSpaces() {
        return this.compilerNode.containsOnlyWhiteSpaces;
    }
}
