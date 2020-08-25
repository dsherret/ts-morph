import { ts } from "@ts-morph/common";
import { ExpressionedNode } from "../expression";
import { IterationStatement } from "./IterationStatement";

export const DoStatementBase = ExpressionedNode(IterationStatement);
export class DoStatement extends DoStatementBase<ts.DoStatement> {
}
