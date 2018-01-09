import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Node, Expression} from "./../common";
import {ChildOrderableNode} from "./../base";
import {Statement} from "./Statement";
import {Identifier} from "../../main";

export const LabeledStatementBase = ChildOrderableNode(Statement);
export class LabeledStatement extends LabeledStatementBase<ts.LabeledStatement> {
    /**
     * Gets this labeled statement's label
     */
    getLabel() {
        return this.getNodeFromCompilerNode(this.compilerNode.label) as Identifier;
    }

    /**
     * Gets this labeled statement's statement
     */
    getStatement() {
        return this.getNodeFromCompilerNode(this.compilerNode.statement) as Statement;
    }

    /**
     * Removes this expression statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
