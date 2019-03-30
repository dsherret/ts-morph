import * as errors from "../../../errors";
import { Identifier } from "../../../main";
import { ts } from "../../../typescript";
import { Statement } from "./Statement";

export class BreakStatement extends Statement<ts.BreakStatement> {
    /**
     * Gets this break statement's label or undefined if it does not exist.
     */
    getLabel(): Identifier | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.label);
    }

    /**
     * Gets this break statement's label or throw if it does not exist.
     */
    getLabelOrThrow() {
        return errors.throwIfNullOrUndefined(this.getLabel(), "Expected to find a label.");
    }
}
