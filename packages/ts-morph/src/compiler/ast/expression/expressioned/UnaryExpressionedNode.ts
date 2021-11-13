import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { UnaryExpression } from "../UnaryExpression";
import { BaseExpressionedNode } from "./ExpressionedNode";

export type UnaryExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.UnaryExpression }>;

export interface UnaryExpressionedNode extends BaseExpressionedNode<UnaryExpression> {
}

export function UnaryExpressionedNode<T extends Constructor<UnaryExpressionedNodeExtensionType>>(Base: T): Constructor<UnaryExpressionedNode> & T {
  return BaseExpressionedNode(Base);
}
