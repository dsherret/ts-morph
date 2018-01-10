import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Type} from "./../type";
import {Node} from "../common";

export class Statement<T extends ts.Statement = ts.Statement> extends Node<T> {
    /**
     * Removes the statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
