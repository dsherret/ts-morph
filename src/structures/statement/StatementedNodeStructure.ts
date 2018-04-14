import { ClassDeclarationStructure } from "../class";
import { EnumDeclarationStructure } from "../enum";
import { FunctionDeclarationStructure } from "../function";
import { InterfaceDeclarationStructure } from "../interface";
import { NamespaceDeclarationStructure } from "../namespace";
import { TypeAliasDeclarationStructure } from "../type";

export interface StatementedNodeStructure {
    classes?: ClassDeclarationStructure[];
    enums?: EnumDeclarationStructure[];
    functions?: FunctionDeclarationStructure[];
    interfaces?: InterfaceDeclarationStructure[];
    namespaces?: NamespaceDeclarationStructure[];
    typeAliases?: TypeAliasDeclarationStructure[];
}
