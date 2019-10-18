import { WriterFunction } from "../../types";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { ImportSpecifierStructure } from "./ImportSpecifierStructure";
import { OptionalKind } from "../types";

export interface ImportDeclarationStructure extends Structure, ImportDeclarationSpecificStructure {
}

export interface ImportDeclarationSpecificStructure extends KindedStructure<StructureKind.ImportDeclaration> {
    defaultImport?: string;
    namespaceImport?: string;
    namedImports?: (OptionalKind<ImportSpecifierStructure> | string | WriterFunction)[] | WriterFunction;
    moduleSpecifier: string;
}
