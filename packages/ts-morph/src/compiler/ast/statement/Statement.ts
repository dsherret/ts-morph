import { ts } from "@ts-morph/common";
import { removeStatementedNodeChild } from "../../../manipulation";
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
