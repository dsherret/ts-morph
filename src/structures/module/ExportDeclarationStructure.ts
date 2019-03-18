import { WriterFunction } from "../../types";
import { ExportSpecifierStructure } from "./ExportSpecifierStructure";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ExportDeclarationStructure extends Structure, ExportDeclarationSpecificStructure {
}

export interface ExportDeclarationSpecificStructure extends KindedStructure<StructureKind.ExportDeclaration> {
    namedExports?: (string | ExportSpecifierStructure | WriterFunction)[] | WriterFunction;
    moduleSpecifier?: string;
}
