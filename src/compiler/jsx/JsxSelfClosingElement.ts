import {ts} from "./../../typescript";
import {PrimaryExpression} from "./../expression";
import {JsxTagNameExpression} from "./../aliases";
import {JsxAttributedNode} from "./base";

export class JsxSelfClosingElement extends JsxAttributedNode(PrimaryExpression)<ts.JsxSelfClosingElement> {
    /**
     * Gets the tag name of the JSX closing element.
     */
    getTagName() {
        return this.getNodeFromCompilerNode<JsxTagNameExpression>(this.compilerNode.tagName);
    }
}
