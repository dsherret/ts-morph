import { WriterFunction } from "../../types";
import { ModuledNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";

export interface SourceFileStructure extends SourceFileSpecificStructure, StatementedNodeStructure, ModuledNodeStructure {
    bodyText?: string | WriterFunction;
}

export interface SourceFileSpecificStructure {
}
