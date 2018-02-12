import * as ts from "typescript";
import {Expression} from "./../expression";
import {JsxTagNameExpression, JsxAttributeLike} from "./../aliases";

export class JsxOpeningElement extends Expression<ts.JsxOpeningElement> {
    /**
     * Gets the tag name of the JSX closing element.
     */
    getTagName() {
        return this.getNodeFromCompilerNode<JsxTagNameExpression>(this.compilerNode.tagName);
    }

    /**
     * Gets the JSX element's attributes.
     */
    getAttributes() {
        return this.compilerNode.attributes.properties.map(p => this.getNodeFromCompilerNode<JsxAttributeLike>(p));
    }
}
