import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

export const PartiallyEmittedExpressionBase = ExpressionedNode(Expression);
export class PartiallyEmittedExpression extends PartiallyEmittedExpressionBase<ts.PartiallyEmittedExpression> {
}
