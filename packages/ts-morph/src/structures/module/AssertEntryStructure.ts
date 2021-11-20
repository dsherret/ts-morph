import { AssertionKeyNamedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface AssertEntryStructure extends Structure, AssertEntryStructureSpecificStructure, AssertionKeyNamedNodeStructure {
}

export interface AssertEntryStructureSpecificStructure extends KindedStructure<StructureKind.AssertEntry> {
  /** String literal value. */
  value: string;
}
