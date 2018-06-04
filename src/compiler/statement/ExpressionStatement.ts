import { ts } from "../../typescript";
import { ChildOrderableNode, JSDocableNode } from "../base";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export const ExpressionStatementBase = JSDocableNode(ChildOrderableNode(Statement));
export class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
    /**
     * Gets this expression statement's expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
