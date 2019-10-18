import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";

export const BinaryExpressionBase = Expression;
export class BinaryExpression<T extends ts.BinaryExpression = ts.BinaryExpression> extends BinaryExpressionBase<T> {
    /**
     * Gets the left side of the binary expression.
     */
    getLeft(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.left);
    }

    /**
     * Gets the operator token of the binary expression.
     */
    getOperatorToken() {
        return this._getNodeFromCompilerNode(this.compilerNode.operatorToken);
    }

    /**
     * Gets the right side of the binary expression.
     */
    getRight(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.right);
    }
}
