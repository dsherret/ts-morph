import { ts } from "@ts-morph/common";
import { LeftHandSideExpression } from "./LeftHandSideExpression";
import { UnaryExpression } from "./UnaryExpression";

export const PostfixUnaryExpressionBase = UnaryExpression;
export class PostfixUnaryExpression extends PostfixUnaryExpressionBase<ts.PostfixUnaryExpression> {
    /**
     * Gets the operator token of the postfix unary expression.
     */
    getOperatorToken() {
        return this.compilerNode.operator;
    }

    /**
     * Gets the operand of the postfix unary expression.
     */
    getOperand(): LeftHandSideExpression {
        return this._getNodeFromCompilerNode(this.compilerNode.operand);
    }
}
