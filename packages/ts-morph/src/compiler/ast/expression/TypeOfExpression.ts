import { ts } from "@ts-morph/common";
import { UnaryExpressionedNode } from "./expressioned";
import { UnaryExpression } from "./UnaryExpression";

export const TypeOfExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class TypeOfExpression extends TypeOfExpressionBase<ts.TypeOfExpression> {
}
