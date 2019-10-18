import { ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { IterationStatement } from "./IterationStatement";

export const DoStatementBase = IterationStatement;
export class DoStatement extends DoStatementBase<ts.DoStatement> {
    /**
     * Gets this do statement's expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
