import * as ts from "typescript";
import * as errors from "./../../errors";
import {verifyAndGetIndex, removeClausedNodeChildren} from "./../../manipulation";
import {Node} from "./../common";
import {TextInsertableNode} from "./../base";

export const CaseBlockBase = TextInsertableNode(Node);
export class CaseBlock extends CaseBlockBase<ts.CaseBlock> {
    getClauses() {
        return this.compilerNode.clauses.map(s => this.getNodeFromCompilerNode(s));
    }

    removeClause(index: number) {
        index = verifyAndGetIndex(index, this.getClauses().length - 1);
        return this.removeClauses([index, index]);
    }

    removeClauses(indexRange: [number, number]) {
        const clauses = this.getClauses();
        errors.throwIfRangeOutOfRange(indexRange, [0, clauses.length], nameof(indexRange));

        removeClausedNodeChildren(clauses.slice(indexRange[0], indexRange[1] + 1));

        return this;
    }
}
