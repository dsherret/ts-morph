import { ts } from "../../typescript";
import { PrimaryExpression } from "./PrimaryExpression";

export const ThisExpressionBase = PrimaryExpression;
export class ThisExpression extends ThisExpressionBase<ts.ThisExpression> {
}
