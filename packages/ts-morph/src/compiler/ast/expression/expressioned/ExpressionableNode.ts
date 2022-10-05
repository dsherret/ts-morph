import { errors, getSyntaxKindName, SyntaxKind, ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { KindToExpressionMappings } from "../../kindToNodeMappings";
import { Expression } from "../Expression";

export type ExpressionableNodeExtensionType = Node<ts.Node & { expression?: ts.Expression }>;

export interface ExpressionableNode {
  /**
   * Gets the expression if it exists or returns undefined.
   */
  getExpression(): Expression | undefined;
  /**
   * Gets the expression if it exists or throws.
   */
  getExpressionOrThrow(message?: string | (() => string)): Expression;
  /**
   * Gets the expression if it is of the specified syntax kind or returns undefined.
   */
  getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
  /**
   * Gets the expression if it is of the specified syntax kind or throws.
   */
  getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
}

export function ExpressionableNode<T extends Constructor<ExpressionableNodeExtensionType>>(Base: T): Constructor<ExpressionableNode> & T {
  return class extends Base implements ExpressionableNode {
    getExpression() {
      return this._getNodeFromCompilerNodeIfExists(this.compilerNode.expression);
    }

    getExpressionOrThrow(message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(this.getExpression(), message || "Expected to find an expression.", this);
    }

    getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind) {
      const expression = this.getExpression();
      return expression?.getKind() === kind ? expression as KindToExpressionMappings[TKind] : undefined;
    }

    getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(this.getExpressionIfKind(kind), message || `An expression with the kind kind ${getSyntaxKindName(kind)} was expected.`, this);
    }
  };
}
