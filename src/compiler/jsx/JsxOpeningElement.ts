import {ts} from "./../../typescript";
import {Expression} from "./../expression";
import {JsxTagNameExpression} from "./../aliases";
import {JsxAttributedNode} from "./base";

export class JsxOpeningElement extends JsxAttributedNode(Expression)<ts.JsxOpeningElement> {
    /**
     * Gets the tag name of the JSX closing element.
     */
    getTagName() {
        return this.getNodeFromCompilerNode<JsxTagNameExpression>(this.compilerNode.tagName);
    }
}
