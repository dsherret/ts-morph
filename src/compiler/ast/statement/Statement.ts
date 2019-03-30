import { removeStatementedNodeChild } from "../../../manipulation";
import { ts } from "../../../typescript";
import { ChildOrderableNode } from "../base";
import { Node } from "../common";

export const StatementBase = ChildOrderableNode(Node);
export class Statement<T extends ts.Statement = ts.Statement> extends StatementBase<T> {
    /**
     * Removes the statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
