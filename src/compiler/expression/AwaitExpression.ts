import * as ts from "typescript";
import {UnaryExpression} from "./UnaryExpression";
import {Expression} from "./Expression";
import {UnaryExpressionedNode} from "./expressioned";

export const AwaitExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class AwaitExpression extends AwaitExpressionBase<ts.AwaitExpression> {
}
