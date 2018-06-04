import { ts } from "../../typescript";
import { BinaryExpression } from "./BinaryExpression";

export const AssignmentExpressionBase = BinaryExpression;
export class AssignmentExpression<
    T extends ts.AssignmentExpression<TOperator> = ts.AssignmentExpression<TOperator>,
    TOperator extends ts.AssignmentOperatorToken = ts.AssignmentOperatorToken
> extends AssignmentExpressionBase<T> {
    /**
     * Gets the operator token of the assignment expression.
     */
    getOperatorToken() {
        return this.getNodeFromCompilerNode(this.compilerNode.operatorToken);
    }
}
