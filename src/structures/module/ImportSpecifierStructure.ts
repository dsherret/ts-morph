import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ImportSpecifierStructure extends Structure, ImportSpecifierSpecificStructure {
}

export interface ImportSpecifierSpecificStructure extends KindedStructure<StructureKind.ImportSpecifier> {
    name: string;
    alias?: string;
}
