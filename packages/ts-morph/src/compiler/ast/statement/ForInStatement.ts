import { ts } from "@ts-morph/common";
import { Expression, ExpressionedNode } from "../expression";
import { VariableDeclarationList } from "../variable";
import { IterationStatement } from "./IterationStatement";

export const ForInStatementBase = ExpressionedNode(IterationStatement);
export class ForInStatement extends ForInStatementBase<ts.ForInStatement> {
  /**
   * Gets this for in statement's initializer.
   */
  getInitializer(): VariableDeclarationList | Expression {
    return this._getNodeFromCompilerNode(this.compilerNode.initializer);
  }
}
