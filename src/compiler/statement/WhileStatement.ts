import * as ts from "typescript";
import {Expression} from "./../common";
import {IterationStatement} from "./IterationStatement";

export const WhileStatementBase = IterationStatement;
export class WhileStatement extends WhileStatementBase<ts.WhileStatement> {
    /**
     * Gets this while statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }
}
