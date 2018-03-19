import {StatementedNodeStructure} from "../statement";
import {ImportDeclarationStructure} from "./ImportDeclarationStructure";
import {ExportDeclarationStructure} from "./ExportDeclarationStructure";

export interface SourceFileStructure extends SourceFileSpecificStructure, StatementedNodeStructure {
}

export interface SourceFileSpecificStructure {
    imports?: ImportDeclarationStructure[];
    exports?: ExportDeclarationStructure[];
}
