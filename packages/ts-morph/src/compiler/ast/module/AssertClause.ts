import { ts } from "@ts-morph/common";
import { removeChildren } from "../../../manipulation";
import { AssertEntryStructure, OptionalKind } from "../../../structures";
import { Node } from "../common";

export const AssertClauseBase = Node;
export class AssertClause extends AssertClauseBase<ts.AssertClause> {
  /** Sets the elements in the assert clause */
  setElements(elements: OptionalKind<AssertEntryStructure>[]) {
    this.replaceWithText(writer => {
      const structurePrinter = this._context.structurePrinterFactory.forAssertEntry();
      structurePrinter.printAssertClause(writer, elements);
    });
    return this;
  }

  /** Gets the elements of the assert clause. */
  getElements() {
    return this.compilerNode.elements.map(e => this._getNodeFromCompilerNode(e));
  }

  /** Removes the assert clause. */
  remove() {
    removeChildren({
      children: [this],
      removePrecedingNewLines: true,
      removePrecedingSpaces: true,
    });
  }
}
