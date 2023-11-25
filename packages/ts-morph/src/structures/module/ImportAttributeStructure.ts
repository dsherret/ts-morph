import { ImportAttributeNamedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface ImportAttributeStructure extends Structure, ImportAttributeStructureSpecificStructure, ImportAttributeNamedNodeStructure {
}

export interface ImportAttributeStructureSpecificStructure extends KindedStructure<StructureKind.ImportAttribute> {
  /** Expression value. Quote this when providing a string. */
  value: string;
}
