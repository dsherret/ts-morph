import { ts } from "@ts-morph/common";
import { Statement } from "./Statement";

export class IterationStatement<T extends ts.IterationStatement = ts.IterationStatement> extends Statement<T> {
    /**
     * Gets this iteration statement's statement.
     */
    getStatement(): Statement {
        return this._getNodeFromCompilerNode(this.compilerNode.statement);
    }
}
