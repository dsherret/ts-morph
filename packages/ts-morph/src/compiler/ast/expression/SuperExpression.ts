import { ts } from "@ts-morph/common";
import { PrimaryExpression } from "./PrimaryExpression";

export const SuperExpressionBase = PrimaryExpression;
export class SuperExpression extends SuperExpressionBase<ts.SuperExpression> {
}
