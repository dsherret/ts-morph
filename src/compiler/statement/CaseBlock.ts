import * as ts from "typescript";
import * as errors from "./../../errors";
import {verifyAndGetIndex, removeClausedNodeChildren} from "./../../manipulation";
import {Node} from "./../common";
import {TextInsertableNode} from "./../base";
import {CaseOrDefaultClause} from "./../aliases";
import {DefaultClause} from "./DefaultClause";

export const CaseBlockBase = TextInsertableNode(Node);
export class CaseBlock extends CaseBlockBase<ts.CaseBlock> {
    /**
     * Gets the clauses.
     */
    getClauses() {
        const clauses: ts.NodeArray<ts.CaseOrDefaultClause> = this.compilerNode.clauses || [];
        return clauses.map(s => this.getNodeFromCompilerNode(s)) as CaseOrDefaultClause[];
    }

    /**
     * Removes the clause at the specified index.
     * @param index - Index.
     */
    removeClause(index: number) {
        index = verifyAndGetIndex(index, this.getClauses().length - 1);
        return this.removeClauses([index, index]);
    }

    /**
     * Removes the clauses in the specified range.
     * @param indexRange - Index range.
     */
    removeClauses(indexRange: [number, number]) {
        const clauses = this.getClauses();
        errors.throwIfRangeOutOfRange(indexRange, [0, clauses.length], nameof(indexRange));

        removeClausedNodeChildren(clauses.slice(indexRange[0], indexRange[1] + 1));

        return this;
    }
}
