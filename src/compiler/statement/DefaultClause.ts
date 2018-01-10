import * as ts from "typescript";
import {removeClausedNodeChild} from "./../../manipulation";
import {Expression, Node} from "./../common";
import {ChildOrderableNode, TextInsertableNode} from "./../base";
import {StatementedNode} from "./StatementedNode";

export const DefaultClauseBase = ChildOrderableNode(TextInsertableNode(StatementedNode(Node)));
export class DefaultClause extends DefaultClauseBase<ts.DefaultClause> {
    remove() {
        removeClausedNodeChild(this);
    }
}
