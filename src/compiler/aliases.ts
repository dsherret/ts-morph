import {ts, SyntaxKind} from "./../typescript";
import {Identifier, ComputedPropertyName, QualifiedName} from "./common";
import {PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment, PrimaryExpression, PropertyAccessExpression} from "./expression";
import {JsxAttribute, JsxSpreadAttribute, JsxText, JsxExpression, JsxElement, JsxSelfClosingElement, JsxFragment} from "./jsx";
import {PropertySignature, MethodSignature, ConstructSignatureDeclaration, CallSignatureDeclaration, IndexSignatureDeclaration} from "./interface";
import {ExternalModuleReference} from "./file";
import {CaseClause, DefaultClause} from "./statement";
import {GetAccessorDeclaration, SetAccessorDeclaration, MethodDeclaration} from "./class";
import {StringLiteral, NumericLiteral, TemplateExpression, NoSubstitutionTemplateLiteral} from "./literal";

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;

/* istanbul ignore next */
function propertyNameAliasValidation() {
    const value: ts.PropertyName = null as any;
    switch (value.kind) {
        case SyntaxKind.Identifier:
        case SyntaxKind.StringLiteral:
        case SyntaxKind.NumericLiteral:
        case SyntaxKind.ComputedPropertyName:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;

/* istanbul ignore next */
function accessorDeclarationAliasValidation() {
    const value: ts.AccessorDeclaration = null as any;
    switch (value.kind) {
        case SyntaxKind.SetAccessor:
        case SyntaxKind.GetAccessor:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type EntityName = Identifier | QualifiedName;

/* istanbul ignore next */
function entityNameValidation() {
    const value: ts.EntityName = null as any;
    switch (value.kind) {
        case SyntaxKind.Identifier:
        case SyntaxKind.QualifiedName:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;

/* istanbul ignore next */
function jsxChildValidation() {
    const value: ts.JsxChild = null as any;
    switch (value.kind) {
        case SyntaxKind.JsxText:
        case SyntaxKind.JsxExpression:
        case SyntaxKind.JsxElement:
        case SyntaxKind.JsxSelfClosingElement:
        case SyntaxKind.JsxFragment:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;

/* istanbul ignore next */
function jsxAttributeValidation() {
    const value: ts.JsxAttributeLike = null as any;
    switch (value.kind) {
        case SyntaxKind.JsxAttribute:
        case SyntaxKind.JsxSpreadAttribute:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type JsxTagNameExpression = PrimaryExpression | PropertyAccessExpression;

/* istanbul ignore next */
function jsxTagNameExpressionValidation() {
    // todo: some way to validate this
}

export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;

/* istanbul ignore next */
function objectLiteralElementLikeAliasValidation() {
    const value: ts.ObjectLiteralElementLike = null as any;
    switch (value.kind) {
        case SyntaxKind.PropertyAssignment:
        case SyntaxKind.ShorthandPropertyAssignment:
        case SyntaxKind.SpreadAssignment:
        case SyntaxKind.MethodDeclaration:
        case SyntaxKind.SetAccessor:
        case SyntaxKind.GetAccessor:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type CaseOrDefaultClause = CaseClause | DefaultClause;

/* istanbul ignore next */
function caseOrDefaultClauseValidation() {
    const value: ts.CaseOrDefaultClause = null as any;
    switch (value.kind) {
        case SyntaxKind.CaseClause:
        case SyntaxKind.DefaultClause:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type ModuleReference = EntityName | ExternalModuleReference;

/* istanbul ignore next */
function moduleReferenceValidation() {
    const value: ts.ModuleReference = null as any;
    switch (value.kind) {
        case SyntaxKind.Identifier:
        case SyntaxKind.QualifiedName:
        case SyntaxKind.ExternalModuleReference:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type TypeElementTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration | IndexSignatureDeclaration;

/* istanbul ignore next */
function typeElementTypes() {
    // todo: some way to validate this
}

export type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;

/* istanbul ignore next */
function templateLiteralValidation() {
    const value: ts.TemplateLiteral = null as any;
    switch (value.kind) {
        case SyntaxKind.TemplateExpression:
        case SyntaxKind.NoSubstitutionTemplateLiteral:
            return;
        default:
            const ensureNever: never = value;
    }
}
