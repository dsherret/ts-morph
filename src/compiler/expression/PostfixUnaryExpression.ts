import * as ts from "typescript";
import {UnaryExpression} from "./UnaryExpression";
import {LeftHandSideExpression} from "./LeftHandSideExpression";

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
    getOperand() {
        return this.getNodeFromCompilerNode(this.compilerNode.operand) as LeftHandSideExpression;
    }
}
