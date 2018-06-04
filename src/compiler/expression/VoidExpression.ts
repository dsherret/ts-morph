import { ts } from "../../typescript";
import { UnaryExpressionedNode } from "./expressioned";
import { UnaryExpression } from "./UnaryExpression";

export const VoidExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class VoidExpression extends VoidExpressionBase<ts.VoidExpression> {
}
