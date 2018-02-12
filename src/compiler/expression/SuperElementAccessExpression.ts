import {ts} from "./../../typescript";
import {Expression} from "./Expression";
import {SuperExpressionedNode} from "./expressioned";
import {ElementAccessExpression} from "./ElementAccessExpression";

export const SuperElementAccessExpressionBase = SuperExpressionedNode(ElementAccessExpression);
export class SuperElementAccessExpression extends SuperElementAccessExpressionBase<ts.SuperElementAccessExpression> {
}
