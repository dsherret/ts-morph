import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Node, Expression} from "./../common";
import {ChildOrderableNode} from "./../base";

export const ExpressionStatementBase = ChildOrderableNode(Node);
export class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
    /**
     * Gets this expression statement's expression.
     */
    getExpression() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Expression;
    }

    /**
     * Removes this expression statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
