import { StatementedNodeStructure } from "../statement";
import { Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface SourceFileStructure extends Structure, SourceFileSpecificStructure, StatementedNodeStructure {
}

export interface SourceFileSpecificStructure {
  kind: StructureKind.SourceFile;
}
