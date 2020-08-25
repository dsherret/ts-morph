import { ts } from "@ts-morph/common";
import { JSDocableNode } from "../base";
import { ExpressionedNode } from "../expression";
import { Statement } from "./Statement";

export const ExpressionStatementBase = ExpressionedNode(JSDocableNode(Statement));
export class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
}
