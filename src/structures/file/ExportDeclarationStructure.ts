import {ExportSpecifierStructure} from "./ExportSpecifierStructure";

export interface ExportDeclarationStructure {
    namedExports?: ExportSpecifierStructure[];
    moduleSpecifier?: string;
}
