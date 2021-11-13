import { ts } from "@ts-morph/common";
import { ExpressionedNode } from "../expression";
import { Statement } from "./Statement";

export const WithStatementBase = ExpressionedNode(Statement);
export class WithStatement extends WithStatementBase<ts.WithStatement> {
  /**
   * Gets this with statement's statement.
   */
  getStatement(): Statement {
    return this._getNodeFromCompilerNode(this.compilerNode.statement);
  }
}
