import { ClassDeclarationStructure, ConstructorDeclarationStructure, GetAccessorDeclarationStructure, SetAccessorDeclarationStructure,
    MethodDeclarationStructure, PropertyDeclarationStructure, MethodDeclarationOverloadStructure, ConstructorDeclarationOverloadStructure } from "./class";
import { DecoratorStructure } from "./decorator";
import { EnumDeclarationStructure, EnumMemberStructure } from "./enum";
import { FunctionDeclarationStructure, FunctionDeclarationOverloadStructure, ParameterDeclarationStructure } from "./function";
import { InterfaceDeclarationStructure, CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure,
    MethodSignatureStructure, PropertySignatureStructure } from "./interface";
import { JSDocStructure } from "./doc";
import { PropertyAssignmentStructure, ShorthandPropertyAssignmentStructure, SpreadAssignmentStructure } from "./expression";
import { JsxAttributeStructure, JsxElementStructure, JsxSpreadAttributeStructure, JsxSelfClosingElementStructure } from "./jsx";
import { NamespaceDeclarationStructure, SourceFileStructure, ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure,
    ExportSpecifierStructure, ImportSpecifierStructure } from "./module";
import { TypeAliasDeclarationStructure, TypeParameterDeclarationStructure } from "./type";
import { VariableStatementStructure, VariableDeclarationStructure } from "./statement";

export type StatementStructures = ClassDeclarationStructure | EnumDeclarationStructure | FunctionDeclarationStructure | InterfaceDeclarationStructure
    | NamespaceDeclarationStructure | TypeAliasDeclarationStructure | ImportDeclarationStructure | ExportDeclarationStructure | ExportAssignmentStructure
    | VariableStatementStructure;

export type ClassMemberStructures = ConstructorDeclarationStructure | GetAccessorDeclarationStructure | SetAccessorDeclarationStructure
    | MethodDeclarationStructure | PropertyDeclarationStructure;

export type TypeElementMemberStructures = CallSignatureDeclarationStructure | ConstructSignatureDeclarationStructure | IndexSignatureDeclarationStructure
    | MethodSignatureStructure | PropertySignatureStructure;

export type InterfaceMemberStructures = TypeElementMemberStructures;

export type ObjectLiteralExpressionPropertyStructures = PropertyAssignmentStructure | ShorthandPropertyAssignmentStructure | SpreadAssignmentStructure
    | GetAccessorDeclarationStructure | SetAccessorDeclarationStructure | MethodDeclarationStructure;

export type JsxStructures = JsxAttributeStructure | JsxSpreadAttributeStructure | JsxElementStructure | JsxSelfClosingElementStructure;

export type Structures = StatementStructures | ClassMemberStructures | EnumMemberStructure | InterfaceMemberStructures
    | ObjectLiteralExpressionPropertyStructures | JsxStructures | FunctionDeclarationOverloadStructure | MethodDeclarationOverloadStructure
    | ConstructorDeclarationOverloadStructure | ParameterDeclarationStructure | TypeParameterDeclarationStructure | SourceFileStructure
    | ExportSpecifierStructure | ImportSpecifierStructure | VariableDeclarationStructure | JSDocStructure | DecoratorStructure;
