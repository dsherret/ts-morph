import { ts } from "@ts-morph/common";
import { removeChildren } from "../../../manipulation";
import { ImportAttributeStructure, OptionalKind } from "../../../structures";
import { Node } from "../common";
import { ImportAttribute } from "./ImportAttribute";

export const ImportAttributesBase = Node;
export class ImportAttributes extends ImportAttributesBase<ts.ImportAttributes> {
  /** Sets the elements in the import attributes */
  setElements(elements: ReadonlyArray<OptionalKind<ImportAttributeStructure>>) {
    this.replaceWithText(writer => {
      const structurePrinter = this._context.structurePrinterFactory.forImportAttribute();
      structurePrinter.printAttributes(writer, elements);
    });
    return this;
  }

  /** Gets the elements of the import attributes. */
  getElements(): ImportAttribute[] {
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
