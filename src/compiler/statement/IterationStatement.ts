import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {ChildOrderableNode} from "./../base";
import {Statement} from "./Statement";

export const IterationStatementBase = ChildOrderableNode(Statement);
export class IterationStatement<T extends ts.IterationStatement = ts.IterationStatement> extends IterationStatementBase<T> {
    /**
     * Gets this iteration statement's statement.
     */
    getStatement() {
        return this.getNodeFromCompilerNode(this.compilerNode.statement) as Statement;
    }

    /**
     * Removes this iteration statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
