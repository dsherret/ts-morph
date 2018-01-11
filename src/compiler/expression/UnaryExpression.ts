import * as ts from "typescript";
import {Expression} from "./Expression";

export const UnaryExpressionBase = Expression;
export class UnaryExpression<T extends ts.UnaryExpression = ts.UnaryExpression> extends UnaryExpressionBase<T> {
}
