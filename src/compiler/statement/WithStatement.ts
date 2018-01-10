import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {ChildOrderableNode} from "./../base";
import {Expression} from "./../common";
import {Statement} from "./Statement";

export const WithStatementBase = ChildOrderableNode(Statement);
export class WithStatement extends WithStatementBase<ts.WithStatement> {
    /**
     * Gets this with statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }

    /**
     * Gets this with statement's statement.
     */
    getStatement() {
        return this.getNodeFromCompilerNode(this.compilerNode.statement) as Statement;
    }

    /**
     * Removes this with statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
