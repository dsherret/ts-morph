import { ts } from "../../typescript";
import { Expression } from "../expression";
import { Node } from "../common";
import { ChildOrderableNode } from "../base";
import { Statement } from "./Statement";

export const IfStatementBase = ChildOrderableNode(Statement);
export class IfStatement extends IfStatementBase<ts.IfStatement> {
    /**
     * Gets this if statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.expression);
    }

    /**
     * Gets this if statement's then statement.
     */
    getThenStatement() {
        return this.getNodeFromCompilerNode<Statement>(this.compilerNode.thenStatement);
    }

    /**
     * Gets this if statement's else statement.
     */
    getElseStatement() {
        return this.getNodeFromCompilerNodeIfExists<Statement>(this.compilerNode.elseStatement);
    }
}
