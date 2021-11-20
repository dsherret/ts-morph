import { ts } from "@ts-morph/common";
import { AssertEntryStructure, AssertEntryStructureSpecificStructure, StructureKind } from "../../../structures";
import { AssertionKeyNamedNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { StringLiteral } from "../literal";

export const AssertEntryBase = AssertionKeyNamedNode(Node);
export class AssertEntry extends AssertEntryBase<ts.AssertEntry> {
  /** Gets the value of the assert entry. */
  getValue(): StringLiteral {
    return this._getNodeFromCompilerNode(this.compilerNode.value);
  }

  /** Sets the name and value. */
  set(structure: Partial<AssertEntryStructure>) {
    callBaseSet(AssertEntryBase.prototype, this, structure);

    if (structure.value)
      this.getValue().setLiteralValue(structure.value);

    return this;
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): AssertEntryStructure {
    return callBaseGetStructure<AssertEntryStructureSpecificStructure>(AssertEntryBase.prototype, this, {
      kind: StructureKind.AssertEntry,
      value: this.getValue().getLiteralValue(),
    });
  }
}
