import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { SuperExpression } from "../SuperExpression";
import { BaseExpressionedNode } from "./ExpressionedNode";

export type SuperExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.SuperExpression }>;

export interface SuperExpressionedNode extends BaseExpressionedNode<SuperExpression> {
}

export function SuperExpressionedNode<T extends Constructor<SuperExpressionedNodeExtensionType>>(Base: T): Constructor<SuperExpressionedNode> & T {
  return BaseExpressionedNode(Base);
}
