import {ImportSpecifierStructure} from "./ImportSpecifierStructure";

export interface ImportDeclarationStructure {
    defaultImport?: string;
    namespaceImport?: string;
    namedImports?: ImportSpecifierStructure[];
    moduleSpecifier: string;
}
