import { ExpressionedNode } from "../expression";
import { Statement } from "./Statement";
import { ts } from "@ts-morph/common";

export const ThrowStatementBase = ExpressionedNode(Statement);
export class ThrowStatement extends ThrowStatementBase<ts.ThrowStatement> {
}
