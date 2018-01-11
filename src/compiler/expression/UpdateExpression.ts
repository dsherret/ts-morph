import * as ts from "typescript";
import {UnaryExpression} from "./UnaryExpression";

export const UpdateExpressionBase = UnaryExpression;
export class UpdateExpression<T extends ts.UpdateExpression = ts.UpdateExpression> extends UpdateExpressionBase<T> {
}
