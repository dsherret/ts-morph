import { removeStatementedNodeChild } from "../../manipulation";
import { ts } from "../../typescript";
import { Node } from "../common";

export class Statement<T extends ts.Statement = ts.Statement> extends Node<T> {
    /**
     * Removes the statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
