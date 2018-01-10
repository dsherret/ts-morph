import * as ts from "typescript";
import * as errors from "./../../errors";
import {Block} from "./Block";
import {CatchClause} from "./CatchClause";
import {Statement} from "./Statement";

export const TryStatementBase = Statement;
export class TryStatement extends TryStatementBase<ts.TryStatement> {

    /**
     * Gets this try statement's try block.
     */
    getTryBlock() {
        return this.getNodeFromCompilerNode(this.compilerNode.tryBlock) as Block;
    }

    /**
     * Gets this try statement's catch clause or undefined if none exists.
     */
    getCatchClause() {
        return this.compilerNode.catchClause == null
            ? undefined
            : this.getNodeFromCompilerNode(this.compilerNode.catchClause) as CatchClause;
    }

    /**
     * Gets this try statement's catch clause or throws if none exists.
     */
    getCatchClauseOrThrow() {
        return errors.throwIfNullOrUndefined(this.getCatchClause(), "Expected to find a catch clause.");
    }

    /**
     * Gets this try statement's finally block or undefined if none exists.
     */
    getFinallyBlock() {
        return this.compilerNode.finallyBlock == null || this.compilerNode.finallyBlock.getFullWidth() === 0
            ? undefined
            : this.getNodeFromCompilerNode(this.compilerNode.finallyBlock) as Block;
    }

    /**
     * Gets this try statement's finally block or throws if none exists.
     */
    getFinallyBlockOrThrow() {
        return errors.throwIfNullOrUndefined(this.getFinallyBlock(), "Expected to find a finally block.");
    }
}
