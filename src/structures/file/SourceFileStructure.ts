import { WriterFunction } from "../../types";
import { StatementedNodeStructure } from "../statement";
import { ExportDeclarationStructure } from "./ExportDeclarationStructure";
import { ImportDeclarationStructure } from "./ImportDeclarationStructure";

export interface SourceFileStructure extends SourceFileSpecificStructure, StatementedNodeStructure {
    bodyText?: string | WriterFunction;
}

export interface SourceFileSpecificStructure {
    imports?: ImportDeclarationStructure[];
    exports?: ExportDeclarationStructure[];
}
