import { ts } from "@ts-morph/common";
import { CaseOrDefaultClause } from "../aliases";
import { ExpressionedNode } from "../expression";
import { CaseBlock } from "./CaseBlock";
import { Statement } from "./Statement";

export const SwitchStatementBase = ExpressionedNode(Statement);
export class SwitchStatement extends SwitchStatementBase<ts.SwitchStatement> {
  /**
   * Gets this switch statement's case block.
   */
  getCaseBlock(): CaseBlock {
    return this._getNodeFromCompilerNode(this.compilerNode.caseBlock);
  }

  /**
   * Gets the switch statement's case block's clauses.
   */
  getClauses(): CaseOrDefaultClause[] {
    // convenience method
    return this.getCaseBlock().getClauses();
  }

  /**
   * Removes the specified clause based on the provided index.
   * @param index - Index.
   */
  removeClause(index: number) {
    return this.getCaseBlock().removeClause(index);
  }

  /**
   * Removes the specified clauses based on the provided index range.
   * @param indexRange - Index range.
   */
  removeClauses(indexRange: [number, number]) {
    return this.getCaseBlock().removeClauses(indexRange);
  }
}
