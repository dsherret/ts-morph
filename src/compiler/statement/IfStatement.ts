import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Node, Expression} from "./../common";
import {ChildOrderableNode} from "./../base";
import {Statement} from "./Statement";

export const IfStatementBase = ChildOrderableNode(Statement);
export class IfStatement extends IfStatementBase<ts.IfStatement> {
    /**
     * Gets this if statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }

    /**
     * Gets this if statement's then statement.
     */
    getThenStatement() {
        return this.getNodeFromCompilerNode(this.compilerNode.thenStatement) as Statement;
    }

    /**
     * Gets this if statement's else statement.
     */
    getElseStatement() {
        return this.compilerNode.elseStatement == null
            ? undefined
            : this.getNodeFromCompilerNode(this.compilerNode.elseStatement) as Statement;
    }

    /**
     * Removes this expression statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
