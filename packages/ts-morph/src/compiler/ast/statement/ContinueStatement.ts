import { errors, ts } from "@ts-morph/common";
import { Identifier } from "../../../main";
import { Statement } from "./Statement";

export class ContinueStatement extends Statement<ts.ContinueStatement> {
    /**
     * Gets this continue statement's label or undefined if it does not exist.
     */
    getLabel(): Identifier | undefined {
        return this.compilerNode.label == null
            ? undefined
            : this._getNodeFromCompilerNode(this.compilerNode.label);
    }

    /**
     * Gets this continue statement's label or throw if it does not exist.
     */
    getLabelOrThrow() {
        return errors.throwIfNullOrUndefined(this.getLabel(), "Expected to find a label.");
    }
}
