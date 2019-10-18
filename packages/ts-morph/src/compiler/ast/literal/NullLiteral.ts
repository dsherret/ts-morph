import { ts } from "@ts-morph/common";
import { PrimaryExpression } from "../expression";

export const NullLiteralBase = PrimaryExpression;
export class NullLiteral extends NullLiteralBase<ts.NullLiteral> {
}
