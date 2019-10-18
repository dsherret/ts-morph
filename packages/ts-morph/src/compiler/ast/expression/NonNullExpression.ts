import { ts } from "@ts-morph/common";
import { ExpressionedNode } from "./expressioned";
import { LeftHandSideExpression } from "./LeftHandSideExpression";

export const NonNullExpressionBase = ExpressionedNode(LeftHandSideExpression);
export class NonNullExpression extends NonNullExpressionBase<ts.NonNullExpression> {
}
