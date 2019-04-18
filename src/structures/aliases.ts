import { ClassDeclarationStructure, ConstructorDeclarationStructure, GetAccessorDeclarationStructure, SetAccessorDeclarationStructure, MethodDeclarationStructure,
    PropertyDeclarationStructure } from "./class";
import { EnumDeclarationStructure, EnumMemberStructure } from "./enum";
import { FunctionDeclarationStructure, FunctionDeclarationOverloadStructure } from "./function";
import { InterfaceDeclarationStructure, CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure,
    MethodSignatureStructure, PropertySignatureStructure } from "./interface";
import { NamespaceDeclarationStructure } from "./module";
import { TypeAliasDeclarationStructure } from "./type";
import { ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure } from "./module";
import { VariableStatementStructure } from "./statement";

export type StatementStructures = ClassDeclarationStructure | EnumDeclarationStructure | FunctionDeclarationStructure
    | InterfaceDeclarationStructure | NamespaceDeclarationStructure | TypeAliasDeclarationStructure
    | ImportDeclarationStructure | ExportDeclarationStructure | ExportAssignmentStructure | VariableStatementStructure;

export type ClassMemberStructures = ConstructorDeclarationStructure | GetAccessorDeclarationStructure | SetAccessorDeclarationStructure | MethodDeclarationStructure
    | PropertyDeclarationStructure;

export type InterfaceMemberStructures = CallSignatureDeclarationStructure | ConstructSignatureDeclarationStructure | IndexSignatureDeclarationStructure
    | MethodSignatureStructure | PropertySignatureStructure;

export type Structures = StatementStructures | ClassMemberStructures | EnumMemberStructure | InterfaceMemberStructures | FunctionDeclarationOverloadStructure;
