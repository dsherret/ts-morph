import {ts} from "../../typescript";
import * as errors from "../../errors";
import {Expression} from "../expression";
import {Node} from "../common";
import {ChildOrderableNode} from "../base";
import {Statement} from "./Statement";
import {Identifier} from "../../main";

export const BreakStatementBase = ChildOrderableNode(Statement);
export class BreakStatement extends BreakStatementBase<ts.BreakStatement> {
    /**
     * Gets this break statement's label or undefined if it does not exist.
     */
    getLabel() {
        return this.getNodeFromCompilerNodeIfExists<Identifier>(this.compilerNode.label);
    }

    /**
     * Gets this break statement's label or throw if it does not exist.
     */
    getLabelOrThrow() {
        return errors.throwIfNullOrUndefined(this.getLabel(), "Expected to find a label.");
    }
}
