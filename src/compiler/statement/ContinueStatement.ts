import {ts} from "./../../typescript";
import * as errors from "../../errors";
import {Node} from "./../common";
import {ChildOrderableNode} from "./../base";
import {Statement} from "./Statement";
import {Identifier} from "../../main";

export const ContinueStatementBase = ChildOrderableNode(Statement);
export class ContinueStatement extends ContinueStatementBase<ts.ContinueStatement> {
    /**
     * Gets this continue statement's label or undefined if it does not exist.
     */
    getLabel() {
        return this.compilerNode.label == null
            ? undefined
            : this.getNodeFromCompilerNode<Identifier>(this.compilerNode.label);
    }

    /**
     * Gets this continue statement's label or throw if it does not exist.
     */
    getLabelOrThrow() {
        return errors.throwIfNullOrUndefined(this.getLabel(), "Expected to find a label.");
    }
}
