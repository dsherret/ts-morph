import { errors, getSyntaxKindName, SyntaxKind, ts } from "@ts-morph/common";
import { ExpressionedNodeStructure } from "../../../../structures";
import { Constructor, InstanceOf, WriterFunction } from "../../../../types";
import { callBaseSet } from "../../callBaseSet";
import { Node } from "../../common";
import { CompilerNodeToWrappedType } from "../../CompilerNodeToWrappedType";
import { KindToExpressionMappings } from "../../kindToNodeMappings";
import { Expression } from "../Expression";

export type ExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.Expression }>;

export interface BaseExpressionedNode<TExpression extends Node> {
  /**
   * Gets the expression.
   */
  getExpression(): TExpression;
  /**
   * Gets the expression if its of a certain kind or returns undefined.
   * @param kind - Syntax kind of the expression.
   */
  getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
  /**
   * Gets the expression if its of a certain kind or throws.
   * @param kind - Syntax kind of the expression.
   */
  getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
  /**
   * Sets the expression.
   * @param textOrWriterFunction - Text to set the expression with.
   */
  setExpression(textOrWriterFunction: string | WriterFunction): this;
}

export function BaseExpressionedNode<
  T extends Constructor<ExpressionedNodeExtensionType>,
  TExpression extends Node = CompilerNodeToWrappedType<InstanceOf<T>["compilerNode"]>,
>(Base: T): Constructor<BaseExpressionedNode<TExpression>> & T {
  return class extends Base implements BaseExpressionedNode<TExpression> {
    getExpression() {
      return this._getNodeFromCompilerNode(this.compilerNode.expression) as any as TExpression;
    }

    getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined {
      const { expression } = this.compilerNode;
      return expression.kind === kind ? (this._getNodeFromCompilerNode(expression) as KindToExpressionMappings[TKind]) : undefined;
    }

    getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToExpressionMappings[TKind] {
      return errors.throwIfNullOrUndefined(this.getExpressionIfKind(kind), message || `An expression of the kind ${getSyntaxKindName(kind)} was expected.`, this);
    }

    setExpression(textOrWriterFunction: string | WriterFunction) {
      this.getExpression().replaceWithText(textOrWriterFunction, this._getWriterWithQueuedChildIndentation());
      return this;
    }

    set(structure: Partial<ExpressionedNodeStructure>) {
      callBaseSet(Base.prototype, this, structure);

      if (structure.expression != null)
        this.setExpression(structure.expression);

      return this;
    }
  };
}

export interface ExpressionedNode extends BaseExpressionedNode<Expression> {
}

export function ExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>>(Base: T): Constructor<ExpressionedNode> & T {
  return BaseExpressionedNode(Base);
}
