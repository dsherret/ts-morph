import { ts } from "@ts-morph/common";
import { ExpressionableNode } from "../expression";
import { Statement } from "./Statement";

export const ReturnStatementBase = ExpressionableNode(Statement);
export class ReturnStatement extends ReturnStatementBase<ts.ReturnStatement> {
}
