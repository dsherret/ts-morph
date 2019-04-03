import { AssertTrue, IsExact } from "conditional-type-checks";
import { ts } from "../../typescript";
import { ArrayBindingPattern, ObjectBindingPattern, BindingElement } from "./binding";
import { GetAccessorDeclaration, MethodDeclaration, SetAccessorDeclaration, ClassDeclaration } from "./class";
import { ComputedPropertyName, Identifier, Node, QualifiedName } from "./common";
import { Decorator } from "./decorator";
import { EnumDeclaration } from "./enum";
import { Expression, PropertyAccessExpression, PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment,
    ThisExpression, OmittedExpression, CallExpression, NewExpression } from "./expression";
import { FunctionDeclaration } from "./function";
import { SourceFile, ExternalModuleReference, ExportAssignment, NamespaceDeclaration } from "./module";
import { CallSignatureDeclaration, ConstructSignatureDeclaration, IndexSignatureDeclaration, MethodSignature, PropertySignature, InterfaceDeclaration,
    CommentTypeElement } from "./interface";
import { JsxAttribute, JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxSpreadAttribute, JsxText, JsxOpeningElement } from "./jsx";
import { NoSubstitutionTemplateLiteral, NumericLiteral, StringLiteral, TemplateExpression, TaggedTemplateExpression } from "./literal";
import { CaseClause, DefaultClause } from "./statement";
import { VariableDeclaration } from "./variable";
import { TypeAliasDeclaration } from "./type";

type WrappedToCompilerNodeType<T extends Node> = T["compilerNode"];

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;
type _PropertyNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<PropertyName>, ts.PropertyName>>;

export type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;
type _AccessorDeclarationTest = AssertTrue<IsExact<WrappedToCompilerNodeType<AccessorDeclaration>, ts.AccessorDeclaration>>;

export type ArrayBindingElement = BindingElement | OmittedExpression;
type _ArrayBindingElementTest = AssertTrue<IsExact<WrappedToCompilerNodeType<ArrayBindingElement>, ts.ArrayBindingElement>>;

export type BindingName = Identifier | BindingPattern;
type _BindingNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<BindingName>, ts.BindingName>>;

export type BindingPattern = ObjectBindingPattern | ArrayBindingPattern;
type _BindingPatternTest = AssertTrue<IsExact<WrappedToCompilerNodeType<BindingPattern>, ts.BindingPattern>>;

export type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | Decorator | JsxOpeningLikeElement;
type _CallLikeExpressionTest = AssertTrue<IsExact<WrappedToCompilerNodeType<CallLikeExpression>, ts.CallLikeExpression>>;

export type DeclarationName = Identifier | StringLiteralLike | NumericLiteral | ComputedPropertyName | BindingPattern;
type _DeclarationNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<DeclarationName>, ts.DeclarationName>>;

export type EntityName = Identifier | QualifiedName;
type _EntityNameTest = AssertTrue<IsExact<WrappedToCompilerNodeType<EntityName>, ts.EntityName>>;

export type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;
type _JsxChildTest = AssertTrue<IsExact<WrappedToCompilerNodeType<JsxChild>, ts.JsxChild>>;

export type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;
type _JsxAttributeLikeTest = AssertTrue<IsExact<WrappedToCompilerNodeType<JsxAttributeLike>, ts.JsxAttributeLike>>;

export type JsxOpeningLikeElement = JsxSelfClosingElement | JsxOpeningElement;
type _JsxOpeningLikeElementTest = AssertTrue<IsExact<WrappedToCompilerNodeType<JsxOpeningLikeElement>, ts.JsxOpeningLikeElement>>;

export type JsxTagNameExpression = Identifier | ThisExpression | JsxTagNamePropertyAccess;
type _JsxTagNameExpressionTest = AssertTrue<IsExact<ts.Identifier | ts.ThisExpression | ts.JsxTagNamePropertyAccess, ts.JsxTagNameExpression>>;
export interface JsxTagNamePropertyAccess extends PropertyAccessExpression {
    getExpression(): JsxTagNameExpression;
}
type _JsxTagNamePropertyAccess = AssertTrue<IsExact<ts.PropertyAccessExpression & { expression: ts.JsxTagNameExpression; }, ts.JsxTagNamePropertyAccess>>;

export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
type _ObjectLiteralElementLikeTest = AssertTrue<IsExact<WrappedToCompilerNodeType<ObjectLiteralElementLike>, ts.ObjectLiteralElementLike>>;

export type CaseOrDefaultClause = CaseClause | DefaultClause;
type _CaseOrDefaultClauseTest = AssertTrue<IsExact<WrappedToCompilerNodeType<CaseOrDefaultClause>, ts.CaseOrDefaultClause>>;

export type ModuleReference = EntityName | ExternalModuleReference;
type _ModuleReferenceTest = AssertTrue<IsExact<WrappedToCompilerNodeType<ModuleReference>, ts.ModuleReference>>;

export type StringLiteralLike = StringLiteral | NoSubstitutionTemplateLiteral;
type _StringLiteralLikeTest = AssertTrue<IsExact<WrappedToCompilerNodeType<StringLiteralLike>, ts.StringLiteralLike>>;

export type TypeElementTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration | IndexSignatureDeclaration | CommentTypeElement;

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
export type LocalTargetDeclarations = SourceFile | ClassDeclaration | InterfaceDeclaration | EnumDeclaration | FunctionDeclaration | VariableDeclaration
    | TypeAliasDeclaration | NamespaceDeclaration | ExportAssignment;

/**
 * Declarations that can be exported from a module.
 * @remarks This may be missing some types. Please open an issue if this returns a type not listed here.
 */
export type ExportedDeclarations = ClassDeclaration | InterfaceDeclaration | EnumDeclaration | FunctionDeclaration | VariableDeclaration
    | TypeAliasDeclaration | NamespaceDeclaration | Expression;
