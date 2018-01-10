import * as ts from "typescript";
import {MemberExpression} from "./MemberExpression";

export const PrimaryExpressionBase = MemberExpression;
export class PrimaryExpression<T extends ts.PrimaryExpression = ts.PrimaryExpression> extends PrimaryExpressionBase<T> {
}
