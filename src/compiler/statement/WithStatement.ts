import * as ts from "typescript";
import {ChildOrderableNode} from "./../base";
import {Expression} from "./../expression";
import {Statement} from "./Statement";

export const WithStatementBase = ChildOrderableNode(Statement);
export class WithStatement extends WithStatementBase<ts.WithStatement> {
    /**
     * Gets this with statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.expression);
    }

    /**
     * Gets this with statement's statement.
     */
    getStatement() {
        return this.getNodeFromCompilerNode<Statement>(this.compilerNode.statement);
    }
}
