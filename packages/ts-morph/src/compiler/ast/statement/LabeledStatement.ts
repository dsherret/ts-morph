import { ts } from "@ts-morph/common";
import { JSDocableNode } from "../base";
import { Statement } from "./Statement";
import { Identifier } from "../name";

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
