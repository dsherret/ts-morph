import * as ts from "typescript";
import {PrimaryExpression} from "./../expression";
import {JsxChild} from "./../aliases";
import {JsxOpeningElement} from "./JsxOpeningElement";
import {JsxClosingElement} from "./JsxClosingElement";

export class JsxElement extends PrimaryExpression<ts.JsxElement> {
    /**
     * Gets the children of the JSX element.
     */
    getJsxChildren(): JsxChild[] {
        return this.compilerNode.children.map(c => this.getNodeFromCompilerNode<JsxChild>(c));
    }

    /**
     * Gets the opening element.
     */
    getOpeningElement() {
        return this.getNodeFromCompilerNode<JsxOpeningElement>(this.compilerNode.openingElement);
    }

    /**
     * Gets the closing element.
     */
    getClosingElement() {
        return this.getNodeFromCompilerNode<JsxClosingElement>(this.compilerNode.closingElement);
    }
}
