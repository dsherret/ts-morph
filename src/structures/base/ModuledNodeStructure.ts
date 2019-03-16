import { ImportDeclarationStructure, ExportDeclarationStructure } from "../module";
import { OptionalKind } from "../types";

export interface ModuledNodeStructure {
    imports?: OptionalKind<ImportDeclarationStructure>[];
    exports?: OptionalKind<ExportDeclarationStructure>[];
}
