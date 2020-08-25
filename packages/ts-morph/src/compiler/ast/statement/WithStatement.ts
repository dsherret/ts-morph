import { ts } from "@ts-morph/common";
import { Statement } from "./Statement";
import { ExpressionedNode } from "../expression";

export const WithStatementBase = ExpressionedNode(Statement);
export class WithStatement extends WithStatementBase<ts.WithStatement> {
    /**
     * Gets this with statement's statement.
     */
    getStatement(): Statement {
        return this._getNodeFromCompilerNode(this.compilerNode.statement);
    }
}
