import { WriterFunction } from "../../types";
import { ImportSpecifierStructure } from "./ImportSpecifierStructure";

export interface ImportDeclarationStructure {
    defaultImport?: string;
    namespaceImport?: string;
    namedImports?: (ImportSpecifierStructure | string | WriterFunction)[] | WriterFunction;
    moduleSpecifier: string;
}
