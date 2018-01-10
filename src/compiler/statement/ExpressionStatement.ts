import * as ts from "typescript";
import {Node, Expression} from "./../common";
import {Statement} from "./Statement";
import {ChildOrderableNode} from "./../base";

export const ExpressionStatementBase = ChildOrderableNode(Statement);
export class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
    /**
     * Gets this expression statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }
}
