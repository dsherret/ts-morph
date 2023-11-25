import { ts } from "@ts-morph/common";
import { ImportAttributeStructure, ImportAttributeStructureSpecificStructure, StructureKind } from "../../../structures";
import { ImportAttributeNamedNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { Expression } from "../expression";

export const ImportAttributeBase = ImportAttributeNamedNode(Node);
export class ImportAttribute extends ImportAttributeBase<ts.ImportAttribute> {
  /** Gets the value of the assert entry. */
  getValue(): Expression {
    return this._getNodeFromCompilerNode(this.compilerNode.value);
  }

  /** Sets the name and value. */
  set(structure: Partial<ImportAttributeStructure>) {
    callBaseSet(ImportAttributeBase.prototype, this, structure);

    if (structure.value)
      this.getValue().replaceWithText(structure.value);

    return this;
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): ImportAttributeStructure {
    return callBaseGetStructure<ImportAttributeStructureSpecificStructure>(ImportAttributeBase.prototype, this, {
      kind: StructureKind.ImportAttribute,
      value: this.getValue().getText(),
    });
  }
}
