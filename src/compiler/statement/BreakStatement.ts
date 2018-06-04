import * as errors from "../../errors";
import { Identifier } from "../../main";
import { ts } from "../../typescript";
import { ChildOrderableNode } from "../base";
import { Statement } from "./Statement";

export const BreakStatementBase = ChildOrderableNode(Statement);
export class BreakStatement extends BreakStatementBase<ts.BreakStatement> {
    /**
     * Gets this break statement's label or undefined if it does not exist.
     */
    getLabel(): Identifier | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.label);
    }

    /**
     * Gets this break statement's label or throw if it does not exist.
     */
    getLabelOrThrow() {
        return errors.throwIfNullOrUndefined(this.getLabel(), "Expected to find a label.");
    }
}
