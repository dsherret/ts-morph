import * as ts from "typescript";
import {Node} from "./Node";
import {Expression} from "./Expression";

export class ComputedPropertyName extends Node<ts.ComputedPropertyName> {
    /**
     * Gets the expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }
}
