import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { ImportExpression } from "../ImportExpression";
import { BaseExpressionedNode } from "./ExpressionedNode";

export type ImportExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.ImportExpression }>;

export interface ImportExpressionedNode extends BaseExpressionedNode<ImportExpression> {
}

export function ImportExpressionedNode<T extends Constructor<ImportExpressionedNodeExtensionType>>(Base: T): Constructor<ImportExpressionedNode> & T {
  return BaseExpressionedNode(Base);
}
