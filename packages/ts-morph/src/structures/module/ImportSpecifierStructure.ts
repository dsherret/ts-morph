import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface ImportSpecifierStructure extends Structure, ImportSpecifierSpecificStructure {
}

export interface ImportSpecifierSpecificStructure extends KindedStructure<StructureKind.ImportSpecifier> {
  name: string;
  alias?: string;
}
