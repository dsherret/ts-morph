import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Expression, Node} from "./../common";
import {ChildOrderableNode} from "./../base";
import {Statement} from "./Statement";
import {CaseBlock} from "./CaseBlock";

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
     * Get if the switch statement is exhaustive. False means it may or may not be exhaustive. See isNotExhaustive.
     */
    isExhaustive() {
        return this.compilerNode.possiblyExhaustive === true;
    }

    /**
     * Get if the switch statement is not exhaustive. False means it may or may not be exhausitve. See isExhaustive.
     */
    isNotExhaustive() {
        return this.compilerNode.possiblyExhaustive === false;
    }

    remove() {
        removeStatementedNodeChild(this);
    }
}
