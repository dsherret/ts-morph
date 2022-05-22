import { ts } from "@ts-morph/common";
import { LeftHandSideExpressionedNode } from "../expression";
import { NodeWithTypeArguments } from "./TypeNode";

export const ExpressionWithTypeArgumentsBase = LeftHandSideExpressionedNode(NodeWithTypeArguments);
export class ExpressionWithTypeArguments extends ExpressionWithTypeArgumentsBase<ts.ExpressionWithTypeArguments> {
}
