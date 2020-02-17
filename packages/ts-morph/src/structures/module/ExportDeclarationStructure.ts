import { WriterFunction } from "../../types";
import { ExportSpecifierStructure } from "./ExportSpecifierStructure";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";

export interface ExportDeclarationStructure extends Structure, ExportDeclarationSpecificStructure {
}

export interface ExportDeclarationSpecificStructure extends KindedStructure<StructureKind.ExportDeclaration> {
    isTypeOnly?: boolean;
    namespaceExport?: string;
    namedExports?: (string | OptionalKind<ExportSpecifierStructure> | WriterFunction)[] | WriterFunction;
    moduleSpecifier?: string;
}
