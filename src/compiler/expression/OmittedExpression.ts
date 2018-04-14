import { ts } from "../../typescript";
import { Expression } from "./Expression";

export const OmittedExpressionBase = Expression;
export class OmittedExpression extends OmittedExpressionBase<ts.OmittedExpression> {
}
