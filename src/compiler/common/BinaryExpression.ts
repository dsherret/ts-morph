import * as ts from "typescript";
import {Node} from "./Node";
import {Expression} from "./Expression";

export const BinaryExpressionBase = Expression;
export class BinaryExpression extends BinaryExpressionBase<ts.BinaryExpression> {
    /**
     * Gets the left side of the binary expression.
     */
    getLeft() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.left, this.sourceFile) as Expression;
    }

    /**
     * Gets the operator token of the binary expression.
     */
    getOperatorToken() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.operatorToken, this.sourceFile);
    }

    /**
     * Gets the right side of the binary expression.
     */
    getRight() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.right, this.sourceFile) as Expression;
    }
}
