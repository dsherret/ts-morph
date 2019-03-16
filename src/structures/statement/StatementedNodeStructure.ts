import { ClassDeclarationStructure } from "../class";
import { EnumDeclarationStructure } from "../enum";
import { FunctionDeclarationStructure } from "../function";
import { InterfaceDeclarationStructure } from "../interface";
import { NamespaceDeclarationStructure } from "../module";
import { TypeAliasDeclarationStructure } from "../type";
import { OptionalKind } from "../types";

export interface StatementedNodeStructure {
    classes?: OptionalKind<ClassDeclarationStructure>[];
    enums?: OptionalKind<EnumDeclarationStructure>[];
    functions?: OptionalKind<FunctionDeclarationStructure>[];
    interfaces?: OptionalKind<InterfaceDeclarationStructure>[];
    namespaces?: OptionalKind<NamespaceDeclarationStructure>[];
    typeAliases?: OptionalKind<TypeAliasDeclarationStructure>[];
}
