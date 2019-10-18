import { ts } from "@ts-morph/common";
import { PrimaryExpression } from "./PrimaryExpression";

export const ImportExpressionBase = PrimaryExpression;
export class ImportExpression extends ImportExpressionBase<ts.ImportExpression> {
}
