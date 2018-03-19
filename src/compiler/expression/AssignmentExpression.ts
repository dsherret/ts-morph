import {ts} from "../../typescript";
import {BinaryExpression} from "./BinaryExpression";
import {Expression} from "./Expression";
import {Node} from "../common";

export const AssignmentExpressionBase = BinaryExpression;
export class AssignmentExpression<
    TOperator extends ts.AssignmentOperatorToken = ts.AssignmentOperatorToken,
    T extends ts.AssignmentExpression<TOperator> = ts.AssignmentExpression<TOperator>
> extends AssignmentExpressionBase<T> {
    /**
     * Gets the operator token of the assignment expression.
     */
    getOperatorToken() {
        return this.getNodeFromCompilerNode(this.compilerNode.operatorToken);
    }
}
