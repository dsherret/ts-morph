import {ts} from "./../../typescript";
import {Node} from "./../common";

export class JsxSpreadAttribute extends Node<ts.JsxSpreadAttribute> {
    /**
     * Gets the JSX spread attribute's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
