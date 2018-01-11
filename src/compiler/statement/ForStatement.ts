import * as ts from "typescript";
import * as errors from "./../../errors";
import {Expression} from "./../expression";
import {IterationStatement} from "./IterationStatement";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const ForStatementBase = IterationStatement;
export class ForStatement extends ForStatementBase<ts.ForStatement> {
    /**
     * Gets this for statement's initializer or undefined if none exists.
     */
    getInitializer() {
        return this.compilerNode.initializer == null
            ? undefined
            : this.getNodeFromCompilerNode(this.compilerNode.initializer) as (VariableDeclarationList | Expression);
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
    getCondition() {
        return this.compilerNode.condition == null
            ? undefined
            : this.getNodeFromCompilerNode(this.compilerNode.condition) as Expression;
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
    getIncrementor() {
        return this.compilerNode.incrementor == null
            ? undefined
            : this.getNodeFromCompilerNode(this.compilerNode.incrementor) as Expression;
    }

    /**
     * Gets this for statement's incrementor or throws if none exists.
     */
    getIncrementorOrThrow() {
        return errors.throwIfNullOrUndefined(this.getIncrementor(), "Expected to find an incrementor.");
    }
}
