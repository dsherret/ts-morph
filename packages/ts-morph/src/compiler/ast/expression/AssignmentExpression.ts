import { ts } from "@ts-morph/common";
import { BinaryExpression } from "./BinaryExpression";

export const AssignmentExpressionBase = BinaryExpression;
export class AssignmentExpression<
    T extends ts.AssignmentExpression<ts.AssignmentOperatorToken> = ts.AssignmentExpression<ts.AssignmentOperatorToken>
>
    extends AssignmentExpressionBase<T>
{
    /**
     * Gets the operator token of the assignment expression.
     */
    getOperatorToken() {
        return this._getNodeFromCompilerNode(this.compilerNode.operatorToken);
    }
}
