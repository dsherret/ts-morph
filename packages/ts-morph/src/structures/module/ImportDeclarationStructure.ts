import { WriterFunction } from "../../types";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { ImportSpecifierStructure } from "./ImportSpecifierStructure";

export interface ImportDeclarationStructure extends Structure, ImportDeclarationSpecificStructure {
}

export interface ImportDeclarationSpecificStructure extends KindedStructure<StructureKind.ImportDeclaration> {
    isTypeOnly?: boolean;
    defaultImport?: string;
    namespaceImport?: string;
    namedImports?: (OptionalKind<ImportSpecifierStructure> | string | WriterFunction)[] | WriterFunction;
    moduleSpecifier: string;
}
