import { ts } from "@ts-morph/common";
import { Identifier } from "../../../main";
import { JSDocableNode } from "../base";
import { Statement } from "./Statement";

export const LabeledStatementBase = JSDocableNode(Statement);
export class LabeledStatement extends LabeledStatementBase<ts.LabeledStatement> {
    /**
     * Gets this labeled statement's label
     */
    getLabel(): Identifier {
        return this._getNodeFromCompilerNode(this.compilerNode.label);
    }

    /**
     * Gets this labeled statement's statement
     */
    getStatement(): Statement {
        return this._getNodeFromCompilerNode(this.compilerNode.statement);
    }
}
