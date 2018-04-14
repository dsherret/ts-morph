import { AssertTrue, IsExactType } from "conditional-type-checks";
import { ts, SyntaxKind } from "../typescript";
import { Identifier, ComputedPropertyName, QualifiedName, Node } from "./common";
import { PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment, PrimaryExpression, PropertyAccessExpression } from "./expression";
import { JsxAttribute, JsxSpreadAttribute, JsxText, JsxExpression, JsxElement, JsxSelfClosingElement, JsxFragment } from "./jsx";
import { PropertySignature, MethodSignature, ConstructSignatureDeclaration, CallSignatureDeclaration, IndexSignatureDeclaration } from "./interface";
import { ExternalModuleReference } from "./file";
import { CaseClause, DefaultClause } from "./statement";
import { GetAccessorDeclaration, SetAccessorDeclaration, MethodDeclaration } from "./class";
import { StringLiteral, NumericLiteral, TemplateExpression, NoSubstitutionTemplateLiteral } from "./literal";

type WrappedToCompilerNodeType<T extends Node> = T["compilerNode"];

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;
type _PropertyNameTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<PropertyName>, ts.PropertyName>>;

export type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;
type _AccessorDeclarationTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<AccessorDeclaration>, ts.AccessorDeclaration>>;

export type EntityName = Identifier | QualifiedName;
type _EntityNameTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<EntityName>, ts.EntityName>>;

export type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;
type _JsxChildTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<JsxChild>, ts.JsxChild>>;

export type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;
type _JsxAttributeLikeTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<JsxAttributeLike>, ts.JsxAttributeLike>>;

export type JsxTagNameExpression = PrimaryExpression | PropertyAccessExpression;
type _JsxTagNameExpressionTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<JsxTagNameExpression>, ts.JsxTagNameExpression>>;

export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
type _ObjectLiteralElementLikeTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<ObjectLiteralElementLike>, ts.ObjectLiteralElementLike>>;

export type CaseOrDefaultClause = CaseClause | DefaultClause;
type _CaseOrDefaultClauseTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<CaseOrDefaultClause>, ts.CaseOrDefaultClause>>;

export type ModuleReference = EntityName | ExternalModuleReference;
type _ModuleReferenceTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<ModuleReference>, ts.ModuleReference>>;

export type TypeElementTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration | IndexSignatureDeclaration;

/* istanbul ignore next */
function typeElementTypes() {
    // todo: some way to validate this
}

export type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;
type _TemplateLiteralTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<TemplateLiteral>, ts.TemplateLiteral>>;
