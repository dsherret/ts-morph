import { ts } from "../../typescript";
import { Expression } from "../expression";
import { IterationStatement } from "./IterationStatement";

export const DoStatementBase = IterationStatement;
export class DoStatement extends DoStatementBase<ts.DoStatement> {
    /**
     * Gets this do statement's expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
