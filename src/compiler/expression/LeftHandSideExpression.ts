import * as ts from "typescript";
import {UpdateExpression} from "./UpdateExpression";

export const LeftHandSideExpressionBase = UpdateExpression;
export class LeftHandSideExpression<T extends ts.LeftHandSideExpression = ts.LeftHandSideExpression> extends LeftHandSideExpressionBase<T> {
}
