import { Identifier } from "../../main";
import { ts } from "../../typescript";
import { ChildOrderableNode, JSDocableNode } from "../base";
import { Statement } from "./Statement";

export const LabeledStatementBase = JSDocableNode(ChildOrderableNode(Statement));
export class LabeledStatement extends LabeledStatementBase<ts.LabeledStatement> {
    /**
     * Gets this labeled statement's label
     */
    getLabel(): Identifier {
        return this.getNodeFromCompilerNode(this.compilerNode.label);
    }

    /**
     * Gets this labeled statement's statement
     */
    getStatement(): Statement {
        return this.getNodeFromCompilerNode(this.compilerNode.statement);
    }
}
