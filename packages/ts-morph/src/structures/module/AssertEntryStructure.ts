import { AssertionKeyNamedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface AssertEntryStructure extends Structure, AssertEntryStructureSpecificStructure, AssertionKeyNamedNodeStructure {
}

export interface AssertEntryStructureSpecificStructure extends KindedStructure<StructureKind.AssertEntry> {
  /** Expression value. Quote this when providing a string. */
  value: string;
}
