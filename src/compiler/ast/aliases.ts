import { AssertTrue, IsExactType } from "conditional-type-checks";
import { ts } from "../../typescript";
import { ArrayBindingPattern, ObjectBindingPattern, BindingElement } from "./binding";
import { GetAccessorDeclaration, MethodDeclaration, SetAccessorDeclaration } from "./class";
import { ComputedPropertyName, Identifier, Node, QualifiedName } from "./common";
import { Decorator } from "./decorator";
import { PropertyAccessExpression, PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment,
    ThisExpression, OmittedExpression, CallExpression, NewExpression } from "./expression";
import { ExternalModuleReference } from "./module";
import { CallSignatureDeclaration, ConstructSignatureDeclaration, IndexSignatureDeclaration, MethodSignature, PropertySignature } from "./interface";
import { JsxAttribute, JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxSpreadAttribute, JsxText, JsxOpeningElement } from "./jsx";
import { NoSubstitutionTemplateLiteral, NumericLiteral, StringLiteral, TemplateExpression, TaggedTemplateExpression } from "./literal";
import { CaseClause, DefaultClause } from "./statement";

type WrappedToCompilerNodeType<T extends Node> = T["compilerNode"];

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;
type _PropertyNameTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<PropertyName>, ts.PropertyName>>;

export type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;
type _AccessorDeclarationTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<AccessorDeclaration>, ts.AccessorDeclaration>>;

export type ArrayBindingElement = BindingElement | OmittedExpression;
type _ArrayBindingElementTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<ArrayBindingElement>, ts.ArrayBindingElement>>;

export type BindingName = Identifier | BindingPattern;
type _BindingNameTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<BindingName>, ts.BindingName>>;

export type BindingPattern = ObjectBindingPattern | ArrayBindingPattern;
type _BindingPatternTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<BindingPattern>, ts.BindingPattern>>;

export type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | Decorator | JsxOpeningLikeElement;
type _CallLikeExpressionTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<CallLikeExpression>, ts.CallLikeExpression>>;

export type DeclarationName = Identifier | StringLiteralLike | NumericLiteral | ComputedPropertyName | BindingPattern;
type _DeclarationNameTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<DeclarationName>, ts.DeclarationName>>;

export type EntityName = Identifier | QualifiedName;
type _EntityNameTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<EntityName>, ts.EntityName>>;

export type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;
type _JsxChildTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<JsxChild>, ts.JsxChild>>;

export type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;
type _JsxAttributeLikeTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<JsxAttributeLike>, ts.JsxAttributeLike>>;

export type JsxOpeningLikeElement = JsxSelfClosingElement | JsxOpeningElement;
type _JsxOpeningLikeElementTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<JsxOpeningLikeElement>, ts.JsxOpeningLikeElement>>;

export type JsxTagNameExpression = Identifier | ThisExpression | JsxTagNamePropertyAccess;
type _JsxTagNameExpressionTest = AssertTrue<IsExactType<ts.Identifier | ts.ThisExpression | ts.JsxTagNamePropertyAccess, ts.JsxTagNameExpression>>;
export interface JsxTagNamePropertyAccess extends PropertyAccessExpression {
    getExpression(): JsxTagNameExpression;
}
type _JsxTagNamePropertyAccess = AssertTrue<IsExactType<ts.PropertyAccessExpression & { expression: ts.JsxTagNameExpression; }, ts.JsxTagNamePropertyAccess>>;

export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
type _ObjectLiteralElementLikeTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<ObjectLiteralElementLike>, ts.ObjectLiteralElementLike>>;

export type CaseOrDefaultClause = CaseClause | DefaultClause;
type _CaseOrDefaultClauseTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<CaseOrDefaultClause>, ts.CaseOrDefaultClause>>;

export type ModuleReference = EntityName | ExternalModuleReference;
type _ModuleReferenceTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<ModuleReference>, ts.ModuleReference>>;

export type StringLiteralLike = StringLiteral | NoSubstitutionTemplateLiteral;
type _StringLiteralLikeTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<StringLiteralLike>, ts.StringLiteralLike>>;

export type TypeElementTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration | IndexSignatureDeclaration;

/* istanbul ignore next */
function typeElementTypes() {
    // todo: some way to validate this
}

export type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;
type _TemplateLiteralTest = AssertTrue<IsExactType<WrappedToCompilerNodeType<TemplateLiteral>, ts.TemplateLiteral>>;
