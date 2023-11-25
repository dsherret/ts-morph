import {
  ClassDeclarationStructure,
  ClassStaticBlockDeclarationStructure,
  ConstructorDeclarationOverloadStructure,
  ConstructorDeclarationStructure,
  GetAccessorDeclarationStructure,
  MethodDeclarationOverloadStructure,
  MethodDeclarationStructure,
  PropertyDeclarationStructure,
  SetAccessorDeclarationStructure,
} from "./class";
import { DecoratorStructure } from "./decorator";
import { JSDocStructure, JSDocTagStructure } from "./doc";
import { EnumDeclarationStructure, EnumMemberStructure } from "./enum";
import { PropertyAssignmentStructure, ShorthandPropertyAssignmentStructure, SpreadAssignmentStructure } from "./expression";
import { FunctionDeclarationOverloadStructure, FunctionDeclarationStructure, ParameterDeclarationStructure } from "./function";
import {
  CallSignatureDeclarationStructure,
  ConstructSignatureDeclarationStructure,
  IndexSignatureDeclarationStructure,
  InterfaceDeclarationStructure,
  MethodSignatureStructure,
  PropertySignatureStructure,
} from "./interface";
import { JsxAttributeStructure, JsxElementStructure, JsxSelfClosingElementStructure, JsxSpreadAttributeStructure } from "./jsx";
import {
  ExportAssignmentStructure,
  ExportDeclarationStructure,
  ExportSpecifierStructure,
  ImportAttributeStructure,
  ImportDeclarationStructure,
  ImportSpecifierStructure,
  ModuleDeclarationStructure,
  SourceFileStructure,
} from "./module";
import { VariableDeclarationStructure, VariableStatementStructure } from "./statement";
import { TypeAliasDeclarationStructure, TypeParameterDeclarationStructure } from "./type";

export type StatementStructures =
  | ClassDeclarationStructure
  | EnumDeclarationStructure
  | FunctionDeclarationStructure
  | InterfaceDeclarationStructure
  | ModuleDeclarationStructure
  | TypeAliasDeclarationStructure
  | ImportDeclarationStructure
  | ExportDeclarationStructure
  | ExportAssignmentStructure
  | VariableStatementStructure;

export type ClassMemberStructures =
  | ConstructorDeclarationStructure
  | GetAccessorDeclarationStructure
  | SetAccessorDeclarationStructure
  | MethodDeclarationStructure
  | PropertyDeclarationStructure
  | ClassStaticBlockDeclarationStructure;

export type TypeElementMemberStructures =
  | CallSignatureDeclarationStructure
  | ConstructSignatureDeclarationStructure
  | IndexSignatureDeclarationStructure
  | MethodSignatureStructure
  | PropertySignatureStructure;

export type InterfaceMemberStructures = TypeElementMemberStructures;

export type ObjectLiteralExpressionPropertyStructures =
  | PropertyAssignmentStructure
  | ShorthandPropertyAssignmentStructure
  | SpreadAssignmentStructure
  | GetAccessorDeclarationStructure
  | SetAccessorDeclarationStructure
  | MethodDeclarationStructure;

export type JsxStructures = JsxAttributeStructure | JsxSpreadAttributeStructure | JsxElementStructure | JsxSelfClosingElementStructure;

export type Structures =
  | ImportAttributeStructure
  | StatementStructures
  | ClassMemberStructures
  | EnumMemberStructure
  | InterfaceMemberStructures
  | ObjectLiteralExpressionPropertyStructures
  | JsxStructures
  | FunctionDeclarationOverloadStructure
  | MethodDeclarationOverloadStructure
  | ConstructorDeclarationOverloadStructure
  | ParameterDeclarationStructure
  | TypeParameterDeclarationStructure
  | SourceFileStructure
  | ExportSpecifierStructure
  | ImportSpecifierStructure
  | VariableDeclarationStructure
  | JSDocStructure
  | JSDocTagStructure
  | DecoratorStructure;
