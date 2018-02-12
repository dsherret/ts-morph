import {ts} from "./../../typescript";
import {UnaryExpression} from "./UnaryExpression";
import {Expression} from "./Expression";
import {UnaryExpressionedNode} from "./expressioned";

export const VoidExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class VoidExpression extends VoidExpressionBase<ts.VoidExpression> {
}
