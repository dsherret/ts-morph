import * as ts from "typescript";
import {LeftHandSideExpression} from "./LeftHandSideExpression";

export const MemberExpressionBase = LeftHandSideExpression;
export class MemberExpression<T extends ts.MemberExpression = ts.MemberExpression> extends MemberExpressionBase<T> {
}
