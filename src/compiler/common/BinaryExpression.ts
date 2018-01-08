import * as ts from "typescript";
import {Node} from "./Node";
import {Expression} from "./Expression";

export const BinaryExpressionBase = Expression;
export class BinaryExpression extends BinaryExpressionBase<ts.BinaryExpression> {
    /**
     * Gets the left side of the binary expression.
     */
    getLeft() {
        return this.getNodeFromCompilerNode(this.compilerNode.left) as Expression;
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
        return this.getNodeFromCompilerNode(this.compilerNode.right) as Expression;
    }
}
