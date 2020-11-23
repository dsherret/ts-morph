import { ClassDeclarationStructure, ConstructorDeclarationOverloadStructure, ConstructorDeclarationStructure, GetAccessorDeclarationStructure,
    MethodDeclarationOverloadStructure, MethodDeclarationStructure, PropertyDeclarationStructure, SetAccessorDeclarationStructure } from "./class";
import { DecoratorStructure } from "./decorator";
import { EnumDeclarationStructure, EnumMemberStructure } from "./enum";
import { FunctionDeclarationOverloadStructure, FunctionDeclarationStructure, ParameterDeclarationStructure } from "./function";
import { CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure, InterfaceDeclarationStructure,
    MethodSignatureStructure, PropertySignatureStructure } from "./interface";
import { JSDocStructure, JSDocTagStructure } from "./doc";
import { PropertyAssignmentStructure, ShorthandPropertyAssignmentStructure, SpreadAssignmentStructure } from "./expression";
import { JsxAttributeStructure, JsxElementStructure, JsxSelfClosingElementStructure, JsxSpreadAttributeStructure } from "./jsx";
import { ExportAssignmentStructure, ExportDeclarationStructure, ExportSpecifierStructure, ImportDeclarationStructure, ImportSpecifierStructure,
    NamespaceDeclarationStructure, SourceFileStructure } from "./module";
import { TypeAliasDeclarationStructure, TypeParameterDeclarationStructure } from "./type";
import { VariableDeclarationStructure, VariableStatementStructure } from "./statement";

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
    | ExportSpecifierStructure | ImportSpecifierStructure | VariableDeclarationStructure | JSDocStructure | JSDocTagStructure | DecoratorStructure;
