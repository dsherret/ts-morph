import { ts } from "../../typescript";
import { UnaryExpressionedNode } from "./expressioned";
import { UnaryExpression } from "./UnaryExpression";

export const AwaitExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class AwaitExpression extends AwaitExpressionBase<ts.AwaitExpression> {
}
