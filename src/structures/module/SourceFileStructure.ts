import { ModuledNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { Structure } from "../Structure";

export interface SourceFileStructure extends Structure, SourceFileSpecificStructure, StatementedNodeStructure, ModuledNodeStructure {
}

export interface SourceFileSpecificStructure {
}
