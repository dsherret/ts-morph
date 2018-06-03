import { ts } from "../../typescript";
import { ChildOrderableNode } from "../base";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export const WithStatementBase = ChildOrderableNode(Statement);
export class WithStatement extends WithStatementBase<ts.WithStatement> {
    /**
     * Gets this with statement's expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }

    /**
     * Gets this with statement's statement.
     */
    getStatement(): Statement {
        return this.getNodeFromCompilerNode(this.compilerNode.statement);
    }
}
