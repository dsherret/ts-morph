import { WriterFunction } from "../../types";
import { StatementedNodeStructure } from "../statement";
import { ImportDeclarationStructure } from "./ImportDeclarationStructure";
import { ExportDeclarationStructure } from "./ExportDeclarationStructure";

export interface SourceFileStructure extends SourceFileSpecificStructure, StatementedNodeStructure {
    bodyText?: string | WriterFunction;
}

export interface SourceFileSpecificStructure {
    imports?: ImportDeclarationStructure[];
    exports?: ExportDeclarationStructure[];
}
