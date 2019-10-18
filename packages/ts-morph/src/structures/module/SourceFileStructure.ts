import { StatementedNodeStructure } from "../statement";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface SourceFileStructure extends Structure, SourceFileSpecificStructure, StatementedNodeStructure {
}

export interface SourceFileSpecificStructure {
    kind: StructureKind.SourceFile;
}
