import { ts } from "@ts-morph/common";
import { ExpressionedNode } from "../expression";
import { IterationStatement } from "./IterationStatement";

export const WhileStatementBase = ExpressionedNode(IterationStatement);
export class WhileStatement extends WhileStatementBase<ts.WhileStatement> {
}
