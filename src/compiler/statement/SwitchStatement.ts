import * as ts from "typescript";
import {Expression, Node} from "./../common";
import {ChildOrderableNode} from "./../base";
import {Statement} from "./Statement";
import {CaseBlock} from "./CaseBlock";
import {CaseOrDefaultClause} from "./../aliases";

export const SwitchStatementBase = ChildOrderableNode(Statement);
export class SwitchStatement extends SwitchStatementBase<ts.SwitchStatement> {
    /**
     * Gets this switch statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }

    /**
     * Gets this switch statement's case block.
     */
    getCaseBlock() {
        return this.getNodeFromCompilerNode(this.compilerNode.caseBlock) as CaseBlock;
    }

    /**
     * Gets the switch statement's case block's clauses.
     */
    getClauses(): CaseOrDefaultClause[] {
        // convenience method
        return this.getCaseBlock().getClauses();
    }

    /**
     * Removes the specified clause based on the provided index.
     * @param index - Index.
     */
    removeClause(index: number) {
        return this.getCaseBlock().removeClause(index);
    }

    /**
     * Removes the specified clauses based on the provided index range.
     * @param indexRange - Index range.
     */
    removeClauses(indexRange: [number, number]) {
        return this.getCaseBlock().removeClauses(indexRange);
    }
}
