import {ts} from "../../typescript";
import {Expression} from "../expression";
import {Node} from "../common";
import {ChildOrderableNode, JSDocableNode} from "../base";
import {Statement} from "./Statement";
import {Identifier} from "../../main";

export const LabeledStatementBase = JSDocableNode(ChildOrderableNode(Statement));
export class LabeledStatement extends LabeledStatementBase<ts.LabeledStatement> {
    /**
     * Gets this labeled statement's label
     */
    getLabel() {
        return this.getNodeFromCompilerNode<Identifier>(this.compilerNode.label);
    }

    /**
     * Gets this labeled statement's statement
     */
    getStatement() {
        return this.getNodeFromCompilerNode<Statement>(this.compilerNode.statement);
    }
}
