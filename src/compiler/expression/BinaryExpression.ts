import { ts } from "../../typescript";
import { Expression } from "./Expression";

export const BinaryExpressionBase = Expression;
export class BinaryExpression<T extends ts.BinaryExpression = ts.BinaryExpression> extends BinaryExpressionBase<T> {
    /**
     * Gets the left side of the binary expression.
     */
    getLeft(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.left);
    }

    /**
     * Gets the operator token of the binary expression.
     */
    getOperatorToken() {
        return this.getNodeFromCompilerNode(this.compilerNode.operatorToken);
    }

    /**
     * Gets the right side of the binary expression.
     */
    getRight(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.right);
    }
}
