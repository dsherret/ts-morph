import { ts } from "@ts-morph/common";
import { Node } from "../common";
import { Expression } from "../expression";

export class ComputedPropertyName extends Node<ts.ComputedPropertyName> {
    /**
     * Gets the expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
