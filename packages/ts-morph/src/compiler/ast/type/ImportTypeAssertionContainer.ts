import { ts } from "@ts-morph/common";
import { Node } from "../common";
import { AssertClause } from "../module";

export class ImportTypeAssertionContainer extends Node<ts.ImportTypeAssertionContainer> {
  getAssertClause(): AssertClause {
    return this._getNodeFromCompilerNode(this.compilerNode.assertClause);
  }

  /** If the assertion clause spans multiple lines. */
  isMultiline() {
    return this.compilerNode.multiLine ?? false;
  }
}
