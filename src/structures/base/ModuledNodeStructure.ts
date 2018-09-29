import { ImportDeclarationStructure, ExportDeclarationStructure } from "../module";

export interface ModuledNodeStructure {
    imports?: ImportDeclarationStructure[];
    exports?: ExportDeclarationStructure[];
}
