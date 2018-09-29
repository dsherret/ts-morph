import { ImportSpecifierStructure } from "./ImportSpecifierStructure";

export interface ImportDeclarationStructure {
    defaultImport?: string;
    namespaceImport?: string;
    namedImports?: (ImportSpecifierStructure | string)[];
    moduleSpecifier: string;
}
