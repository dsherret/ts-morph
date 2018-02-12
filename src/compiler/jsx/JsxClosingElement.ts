import {ts} from "./../../typescript";
import {Node} from "./../common";
import {JsxTagNameExpression} from "./../aliases";

export class JsxClosingElement extends Node<ts.JsxClosingElement> {
    /**
     * Gets the tag name of the JSX closing element.
     */
    getTagName() {
        return this.getNodeFromCompilerNode<JsxTagNameExpression>(this.compilerNode.tagName);
    }
}
