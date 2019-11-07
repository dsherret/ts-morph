import { removeClausedNodeChild } from "../../../manipulation";
import { ts } from "../../../typescript";
import { TextInsertableNode } from "../base";
import { Node } from "../common";
import { Expression } from "../expression";
import { StatementedNode } from "./StatementedNode";

const createCaseClauseBase = <T extends typeof Node>(ctor: T) => TextInsertableNode(StatementedNode(ctor));
export const CaseClauseBase = createCaseClauseBase(Node);
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
