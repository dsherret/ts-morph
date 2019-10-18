import { errors, ts } from "@ts-morph/common";
import { removeClausedNodeChildren, verifyAndGetIndex } from "../../../manipulation";
import { CaseOrDefaultClause } from "../aliases";
import { TextInsertableNode } from "../base";
import { Node } from "../common";

export const CaseBlockBase = TextInsertableNode(Node);
export class CaseBlock extends CaseBlockBase<ts.CaseBlock> {
    /**
     * Gets the clauses.
     */
    getClauses(): CaseOrDefaultClause[] {
        const clauses: ts.NodeArray<ts.CaseOrDefaultClause> = this.compilerNode.clauses || [];
        return clauses.map(s => this._getNodeFromCompilerNode(s));
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
