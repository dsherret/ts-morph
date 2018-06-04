import { ts } from "../../typescript";
import { UnaryExpression } from "./UnaryExpression";

export const PrefixUnaryExpressionBase = UnaryExpression;
export class PrefixUnaryExpression extends PrefixUnaryExpressionBase<ts.PrefixUnaryExpression> {
    /**
     * Gets the operator token of the prefix unary expression.
     */
    getOperatorToken() {
        return this.compilerNode.operator;
    }

    /**
     * Gets the operand of the prefix unary expression.
     */
    getOperand(): UnaryExpression {
        return this.getNodeFromCompilerNode(this.compilerNode.operand);
    }
}
