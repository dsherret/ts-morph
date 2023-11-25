import { ts } from "@ts-morph/common";
import type { Node } from "./../common/Node";
import { Expression } from "./Expression";

export interface InstanceofExpression extends BinaryExpression {
  compilerNode: ts.InstanceofExpression;
  getOperatorToken(): Node<ts.Token<ts.SyntaxKind.InstanceOfKeyword>>;
}

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
