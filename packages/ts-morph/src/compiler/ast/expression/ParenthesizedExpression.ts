import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

export const ParenthesizedExpressionBase = ExpressionedNode(Expression);
export class ParenthesizedExpression extends ParenthesizedExpressionBase<ts.ParenthesizedExpression> {
}
