import { errors, ts } from "@ts-morph/common";
import { Node } from "../common";
import { VariableDeclaration } from "../variable";
import { Block } from "./Block";

export const CatchClauseBase = Node;
export class CatchClause extends CatchClauseBase<ts.CatchClause> {
  /**
   * Gets this catch clause's block.
   */
  getBlock(): Block {
    return this._getNodeFromCompilerNode(this.compilerNode.block);
  }

  /**
   * Gets this catch clause's variable declaration or undefined if none exists.
   */
  getVariableDeclaration(): VariableDeclaration | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.variableDeclaration);
  }

  /**
   * Gets this catch clause's variable declaration or throws if none exists.
   */
  getVariableDeclarationOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getVariableDeclaration(), message || "Expected to find a variable declaration.", this);
  }
}
