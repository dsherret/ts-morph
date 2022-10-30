import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface ExportSpecifierStructure extends Structure, ExportSpecifierSpecificStructure {
}

export interface ExportSpecifierSpecificStructure extends KindedStructure<StructureKind.ExportSpecifier> {
  name: string;
  alias?: string;
  isTypeOnly?: boolean;
}
