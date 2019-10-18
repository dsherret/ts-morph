import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";

export const OmittedExpressionBase = Expression;
export class OmittedExpression extends OmittedExpressionBase<ts.OmittedExpression> {
}
