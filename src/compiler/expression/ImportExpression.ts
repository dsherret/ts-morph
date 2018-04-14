import { ts } from "../../typescript";
import { PrimaryExpression } from "./PrimaryExpression";

export const ImportExpressionBase = PrimaryExpression;
export class ImportExpression extends ImportExpressionBase<ts.ImportExpression> {
}
