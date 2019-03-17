import { ClassDeclarationStructure } from "./class";
import { EnumDeclarationStructure } from "./enum";
import { FunctionDeclarationStructure } from "./function";
import { InterfaceDeclarationStructure } from "./interface";
import { NamespaceDeclarationStructure } from "./module";
import { TypeAliasDeclarationStructure } from "./type";
import { ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure } from "./module";
import { VariableStatementStructure } from "./statement";

export type StatementStructures = ClassDeclarationStructure | EnumDeclarationStructure | FunctionDeclarationStructure
    | InterfaceDeclarationStructure | NamespaceDeclarationStructure | TypeAliasDeclarationStructure
    | ImportDeclarationStructure | ExportDeclarationStructure | ExportAssignmentStructure | VariableStatementStructure;
