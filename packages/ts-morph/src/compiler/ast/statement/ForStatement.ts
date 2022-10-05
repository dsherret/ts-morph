import { errors, ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { VariableDeclarationList } from "../variable";
import { IterationStatement } from "./IterationStatement";

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
  getInitializerOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getInitializer(), message || "Expected to find an initializer.", this);
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
  getConditionOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getCondition(), message || "Expected to find a condition.", this);
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
  getIncrementorOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getIncrementor(), message || "Expected to find an incrementor.", this);
  }
}
