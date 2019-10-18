import { ts } from "@ts-morph/common";
import { PrimaryExpression } from "./PrimaryExpression";

export const ThisExpressionBase = PrimaryExpression;
export class ThisExpression extends ThisExpressionBase<ts.ThisExpression> {
}
