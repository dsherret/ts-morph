import { ts } from "@ts-morph/common";
import { removeClausedNodeChild } from "../../../manipulation";
import { TextInsertableNode } from "../base";
import { Node } from "../common";
import { StatementedNode } from "./StatementedNode";

export const DefaultClauseBase = TextInsertableNode(StatementedNode(Node));
export class DefaultClause extends DefaultClauseBase<ts.DefaultClause> {
    /**
     * Removes the default clause.
     */
    remove() {
        removeClausedNodeChild(this);
    }
}
