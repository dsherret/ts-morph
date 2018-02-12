import {ts} from "./../../typescript";
import {Expression} from "./Expression";
import {ExpressionedNode} from "./expressioned";
import {TypedNode} from "./../base";

export const AsExpressionBase = TypedNode(ExpressionedNode(Expression));
export class AsExpression extends AsExpressionBase<ts.AsExpression> {
}
