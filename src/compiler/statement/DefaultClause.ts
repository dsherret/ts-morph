import { removeClausedNodeChild } from "../../manipulation";
import { ts } from "../../typescript";
import { ChildOrderableNode, TextInsertableNode } from "../base";
import { Node } from "../common";
import { StatementedNode } from "./StatementedNode";

export const DefaultClauseBase = ChildOrderableNode(TextInsertableNode(StatementedNode(Node)));
export class DefaultClause extends DefaultClauseBase<ts.DefaultClause> {
    /**
     * Removes the default clause.
     */
    remove() {
        removeClausedNodeChild(this);
    }
}
