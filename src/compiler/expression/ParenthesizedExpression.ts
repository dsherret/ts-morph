import { ts } from "../../typescript";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

export const ParenthesizedExpressionBase = ExpressionedNode(Expression);
export class ParenthesizedExpression extends ParenthesizedExpressionBase<ts.ParenthesizedExpression> {
}
