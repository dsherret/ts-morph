import { ts } from "@ts-morph/common";
import { ExpressionedNode } from "../expression";
import { Statement } from "./Statement";

export const ThrowStatementBase = ExpressionedNode(Statement);
export class ThrowStatement extends ThrowStatementBase<ts.ThrowStatement> {
}
