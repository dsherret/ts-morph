import { ts } from "../../typescript";
import { Node } from "../common";
import { Expression } from "./Expression";

export const BinaryExpressionBase = Expression;
export class BinaryExpression<T extends ts.BinaryExpression = ts.BinaryExpression> extends BinaryExpressionBase<T> {
    /**
     * Gets the left side of the binary expression.
     */
    getLeft() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.left);
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
    getRight() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.right);
    }
}
