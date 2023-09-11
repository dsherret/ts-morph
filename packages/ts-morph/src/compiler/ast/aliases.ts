import { ts } from "@ts-morph/common";
import { AssertTrue, IsExact } from "conditional-type-checks";
import { ArrayBindingPattern, BindingElement, ObjectBindingPattern } from "./binding";
import { ClassDeclaration, GetAccessorDeclaration, MethodDeclaration, SetAccessorDeclaration } from "./class";
import { Node } from "./common";
import { Decorator } from "./decorator";
import { EnumDeclaration } from "./enum";
import {
  CallExpression,
  ElementAccessExpression,
  Expression,
  NewExpression,
  OmittedExpression,
  PropertyAccessExpression,
  PropertyAssignment,
  ShorthandPropertyAssignment,
  SpreadAssignment,
  ThisExpression,
} from "./expression";
import { FunctionDeclaration } from "./function";
import {
  CallSignatureDeclaration,
  ConstructSignatureDeclaration,
  IndexSignatureDeclaration,
  InterfaceDeclaration,
  MethodSignature,
  PropertySignature,
} from "./interface";
import {
  JsxAttribute,
  JsxElement,
  JsxExpression,
  JsxFragment,
  JsxNamespacedName,
  JsxOpeningElement,
  JsxSelfClosingElement,
  JsxSpreadAttribute,
  JsxText,
} from "./jsx";
import {
  FalseLiteral,
  NoSubstitutionTemplateLiteral,
  NumericLiteral,
  StringLiteral,
  TaggedTemplateExpression,
  TemplateExpression,
  TrueLiteral,
} from "./literal";
import { ExportAssignment, ExternalModuleReference, ModuleDeclaration, SourceFile } from "./module";
import { ComputedPropertyName, Identifier, PrivateIdentifier, QualifiedName } from "./name";
import { CaseClause, DefaultClause } from "./statement";
import { TypeAliasDeclaration } from "./type";
import { VariableDeclaration } from "./variable";

type WrappedToCompilerNodeType<T extends Node> = T["compilerNode"];

export type AssertionKey = Identifier | StringLiteral;
type _AssertionKeyTest = AssertTrue<IsExact<WrappedToCompilerNodeType<AssertionKey>, ts.AssertionKey>>;

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName | PrivateIdentifier;
type _PropertyNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<PropertyName>, ts.PropertyName>>;

export type ModuleName = Identifier | StringLiteral;
type _ModuleNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<ModuleName>, ts.ModuleName>>;

export type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;
type _AccessorDeclarationTest = AssertTrue<IsExact<WrappedToCompilerNodeType<AccessorDeclaration>, ts.AccessorDeclaration>>;

export type ArrayBindingElement = BindingElement | OmittedExpression;
type _ArrayBindingElementTest = AssertTrue<IsExact<WrappedToCompilerNodeType<ArrayBindingElement>, ts.ArrayBindingElement>>;

export type BindingName = Identifier | BindingPattern;
type _BindingNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<BindingName>, ts.BindingName>>;

export type BindingPattern = ObjectBindingPattern | ArrayBindingPattern;
type _BindingPatternTest = AssertTrue<IsExact<WrappedToCompilerNodeType<BindingPattern>, ts.BindingPattern>>;

export type BooleanLiteral = TrueLiteral | FalseLiteral;
type _BooleanLiteralTest = AssertTrue<IsExact<WrappedToCompilerNodeType<BooleanLiteral>, ts.BooleanLiteral>>;

export type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | Decorator | JsxOpeningLikeElement;
type _CallLikeExpressionTest = AssertTrue<IsExact<WrappedToCompilerNodeType<CallLikeExpression>, ts.CallLikeExpression>>;

export type EntityNameExpression = Identifier | PropertyAccessExpression;
type _EntityNameExpressionTest = AssertTrue<IsExact<WrappedToCompilerNodeType<EntityNameExpression>, MapPropAccessEntityNameExpr<ts.EntityNameExpression>>>;
// not going to support this brand at this time
type MapPropAccessEntityNameExpr<T> = T extends ts.PropertyAccessEntityNameExpression ? ts.PropertyAccessExpression : T;

export type DeclarationName =
  | PropertyName
  | JsxAttributeName
  | StringLiteralLike
  | ElementAccessExpression
  | BindingPattern
  | EntityNameExpression;
type _DeclarationNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<DeclarationName>, MapPropAccessEntityNameExpr<ts.DeclarationName>>>;

export type EntityName = Identifier | QualifiedName;
type _EntityNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<EntityName>, ts.EntityName>>;

export type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;
type _JsxChildTest = AssertTrue<IsExact<WrappedToCompilerNodeType<JsxChild>, ts.JsxChild>>;

export type JsxAttributeName = Identifier | JsxNamespacedName;
type _JsxAttributeNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<JsxAttributeName>, ts.JsxAttributeName>>;

export type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;
type _JsxAttributeLikeTest = AssertTrue<IsExact<WrappedToCompilerNodeType<JsxAttributeLike>, ts.JsxAttributeLike>>;

export type JsxOpeningLikeElement = JsxSelfClosingElement | JsxOpeningElement;
type _JsxOpeningLikeElementTest = AssertTrue<IsExact<WrappedToCompilerNodeType<JsxOpeningLikeElement>, ts.JsxOpeningLikeElement>>;

export type JsxTagNameExpression = Identifier | ThisExpression | JsxTagNamePropertyAccess | JsxNamespacedName;
type _JsxTagNameExpressionTest = AssertTrue<
  IsExact<ts.Identifier | ts.ThisExpression | ts.JsxTagNamePropertyAccess | ts.JsxNamespacedName, ts.JsxTagNameExpression>
>;
export interface JsxTagNamePropertyAccess extends PropertyAccessExpression {
  getExpression(): Identifier | ThisExpression | JsxTagNamePropertyAccess;
}
type _JsxTagNamePropertyAccess = AssertTrue<
  IsExact<ts.PropertyAccessExpression & { expression: ts.Identifier | ts.ThisExpression | ts.JsxTagNamePropertyAccess }, ts.JsxTagNamePropertyAccess>
>;

export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
type _ObjectLiteralElementLikeTest = AssertTrue<IsExact<WrappedToCompilerNodeType<ObjectLiteralElementLike>, ts.ObjectLiteralElementLike>>;

export type CaseOrDefaultClause = CaseClause | DefaultClause;
type _CaseOrDefaultClauseTest = AssertTrue<IsExact<WrappedToCompilerNodeType<CaseOrDefaultClause>, ts.CaseOrDefaultClause>>;

export type ModuleReference = EntityName | ExternalModuleReference;
type _ModuleReferenceTest = AssertTrue<IsExact<WrappedToCompilerNodeType<ModuleReference>, ts.ModuleReference>>;

export type StringLiteralLike = StringLiteral | NoSubstitutionTemplateLiteral;
type _StringLiteralLikeTest = AssertTrue<IsExact<WrappedToCompilerNodeType<StringLiteralLike>, ts.StringLiteralLike>>;

export type TypeElementTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration | IndexSignatureDeclaration;

/* istanbul ignore next */
function typeElementTypes() {
  // todo: some way to validate this
}

export type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;
type _TemplateLiteralTest = AssertTrue<IsExact<WrappedToCompilerNodeType<TemplateLiteral>, ts.TemplateLiteral>>;

/**
 * Local target declarations.
 * @remarks This may be missing some types. Please open an issue if this returns a type not listed here.
 */
export type LocalTargetDeclarations =
  | SourceFile
  | ClassDeclaration
  | InterfaceDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | VariableDeclaration
  | TypeAliasDeclaration
  | ModuleDeclaration
  | ExportAssignment;

/**
 * Declarations that can be exported from a module.
 * @remarks This may be missing some types. Please open an issue if this returns a type not listed here.
 */
export type ExportedDeclarations =
  | ClassDeclaration
  | InterfaceDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | VariableDeclaration
  | TypeAliasDeclaration
  | ModuleDeclaration
  | Expression
  | SourceFile;
