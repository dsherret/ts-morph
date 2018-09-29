import { ImportDeclarationStructure, ExportDeclarationStructure } from "../file";

export interface ModuledNodeStructure {
    imports?: ImportDeclarationStructure[];
    exports?: ExportDeclarationStructure[];
}
