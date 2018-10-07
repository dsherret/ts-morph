import { WriterFunction } from "../../types";
import { ExportSpecifierStructure } from "./ExportSpecifierStructure";

export interface ExportDeclarationStructure {
    namedExports?: (string | ExportSpecifierStructure | WriterFunction)[] | WriterFunction;
    moduleSpecifier?: string;
}
