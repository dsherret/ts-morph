import { ts } from "../../typescript";
import { removeClausedNodeChild } from "../../manipulation";
import { Expression } from "../expression";
import { Node } from "../common";
import { ChildOrderableNode, TextInsertableNode } from "../base";
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
