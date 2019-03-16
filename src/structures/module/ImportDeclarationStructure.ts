import { WriterFunction } from "../../types";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { ImportSpecifierStructure } from "./ImportSpecifierStructure";

export interface ImportDeclarationStructure extends Structure<StructureKind.ImportDeclaration> {
    defaultImport?: string;
    namespaceImport?: string;
    namedImports?: (ImportSpecifierStructure | string | WriterFunction)[] | WriterFunction;
    moduleSpecifier: string;
}
