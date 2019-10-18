import { errors, ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { IterationStatement } from "./IterationStatement";
import { VariableDeclarationList } from "../variable";

export const ForStatementBase = IterationStatement;
export class ForStatement extends ForStatementBase<ts.ForStatement> {
    /**
     * Gets this for statement's initializer or undefined if none exists.
     */
    getInitializer(): VariableDeclarationList | Expression | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.initializer);
    }

    /**
     * Gets this for statement's initializer or throws if none exists.
     */
    getInitializerOrThrow() {
        return errors.throwIfNullOrUndefined(this.getInitializer(), "Expected to find an initializer.");
    }

    /**
     * Gets this for statement's condition or undefined if none exists.
     */
    getCondition(): Expression | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.condition);
    }

    /**
     * Gets this for statement's condition or throws if none exists.
     */
    getConditionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getCondition(), "Expected to find a condition.");
    }

    /**
     * Gets this for statement's incrementor.
     */
    getIncrementor(): Expression | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.incrementor);
    }

    /**
     * Gets this for statement's incrementor or throws if none exists.
     */
    getIncrementorOrThrow() {
        return errors.throwIfNullOrUndefined(this.getIncrementor(), "Expected to find an incrementor.");
    }
}
