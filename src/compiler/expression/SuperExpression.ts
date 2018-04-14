import { ts } from "../../typescript";
import { PrimaryExpression } from "./PrimaryExpression";

export const SuperExpressionBase = PrimaryExpression;
export class SuperExpression extends SuperExpressionBase<ts.SuperExpression> {
}
