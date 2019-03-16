import { WriterFunction } from "../../types";
import { ExportSpecifierStructure } from "./ExportSpecifierStructure";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ExportDeclarationStructure extends Structure<StructureKind.ExportDeclaration> {
    namedExports?: (string | ExportSpecifierStructure | WriterFunction)[] | WriterFunction;
    moduleSpecifier?: string;
}
