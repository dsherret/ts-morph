import { ExportSpecifierStructure } from "./ExportSpecifierStructure";

export interface ExportDeclarationStructure {
    namedExports?: (string | ExportSpecifierStructure)[];
    moduleSpecifier?: string;
}
