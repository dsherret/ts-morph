import { ts } from "@ts-morph/common";
import { removeClausedNodeChild } from "../../../manipulation";
import { TextInsertableNode } from "../base";
import { Node } from "../common";
import { ExpressionedNode } from "../expression";
import { StatementedNode } from "./StatementedNode";

const createBase = <T extends typeof Node>(ctor: T) => ExpressionedNode(TextInsertableNode(StatementedNode(ctor)));
export const CaseClauseBase = createBase(Node);
export class CaseClause extends CaseClauseBase<ts.CaseClause> {
  /**
   * Removes this case clause.
   */
  remove() {
    removeClausedNodeChild(this);
  }
}
