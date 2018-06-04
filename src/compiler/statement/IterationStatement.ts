import { ts } from "../../typescript";
import { ChildOrderableNode } from "../base";
import { Statement } from "./Statement";

export const IterationStatementBase = ChildOrderableNode(Statement);
export class IterationStatement<T extends ts.IterationStatement = ts.IterationStatement> extends IterationStatementBase<T> {
    /**
     * Gets this iteration statement's statement.
     */
    getStatement(): Statement {
        return this.getNodeFromCompilerNode(this.compilerNode.statement);
    }
}
