import {ts} from "./../../typescript";
import {Node} from "./Node";
import {Expression} from "./../expression";

export class ComputedPropertyName extends Node<ts.ComputedPropertyName> {
    /**
     * Gets the expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.expression);
    }
}
