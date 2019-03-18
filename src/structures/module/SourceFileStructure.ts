import { StatementedNodeStructure } from "../statement";
import { Structure } from "../Structure";

export interface SourceFileStructure extends Structure, SourceFileSpecificStructure, StatementedNodeStructure {
}

export interface SourceFileSpecificStructure {
}
