import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ExportSpecifierStructure extends Structure, ExportSpecifierSpecificStructure {
}

export interface ExportSpecifierSpecificStructure extends KindedStructure<StructureKind.ExportSpecifier> {
    name: string;
    alias?: string;
}
