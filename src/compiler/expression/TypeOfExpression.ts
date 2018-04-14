import { ts } from "../../typescript";
import { UnaryExpression } from "./UnaryExpression";
import { Expression } from "./Expression";
import { UnaryExpressionedNode } from "./expressioned";

export const TypeOfExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class TypeOfExpression extends TypeOfExpressionBase<ts.TypeOfExpression> {
}
