import * as ts from "typescript";
import {LeftHandSideExpression} from "./LeftHandSideExpression";
import {ExpressionedNode} from "./expressioned";

export const NonNullExpressionBase = ExpressionedNode(LeftHandSideExpression);
export class NonNullExpression extends NonNullExpressionBase<ts.NonNullExpression> {
}
