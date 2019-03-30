import { removeClausedNodeChild } from "../../../manipulation";
import { ts } from "../../../typescript";
import { TextInsertableNode } from "../base";
import { Node } from "../common";
import { Expression } from "../expression";
import { StatementedNode } from "./StatementedNode";

export const CaseClauseBase = TextInsertableNode(StatementedNode(Node));
export class CaseClause extends CaseClauseBase<ts.CaseClause> {
    /**
     * Gets this switch statement's expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }

    /**
     * Removes this case clause.
     */
    remove() {
        removeClausedNodeChild(this);
    }
}
