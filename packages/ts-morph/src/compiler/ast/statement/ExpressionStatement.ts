import { ts } from "@ts-morph/common";
import { JSDocableNode } from "../base";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export const ExpressionStatementBase = JSDocableNode(Statement);
export class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
    /**
     * Gets this expression statement's expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
