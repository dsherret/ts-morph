import * as ts from "typescript";
import {removeClausedNodeChild} from "./../../manipulation";
import {Expression} from "./../expression";
import {Node} from "./../common";
import {ChildOrderableNode, TextInsertableNode} from "./../base";
import {StatementedNode} from "./StatementedNode";

export const CaseClauseBase = ChildOrderableNode(TextInsertableNode(StatementedNode(Node)));
export class CaseClause extends CaseClauseBase<ts.CaseClause> {
    /**
     * Gets this switch statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }

    /**
     * Removes this case clause.
     */
    remove() {
        removeClausedNodeChild(this);
    }
}
