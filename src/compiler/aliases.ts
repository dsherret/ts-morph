import * as ts from "typescript";
import {Identifier, ComputedPropertyName, QualifiedName} from "./common";
import {PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment} from "./expression";
import {ExternalModuleReference} from "./file";
import {CaseClause, DefaultClause} from "./statement";
import {GetAccessorDeclaration, SetAccessorDeclaration, MethodDeclaration} from "./class";
import {StringLiteral, NumericLiteral} from "./literal";

export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;

/* istanbul ignore next */
function propertyNameAliasValidation() {
    const value: ts.PropertyName = null as any;
    switch (value.kind) {
        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NumericLiteral:
        case ts.SyntaxKind.ComputedPropertyName:
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
        case ts.SyntaxKind.SetAccessor:
        case ts.SyntaxKind.GetAccessor:
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
        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.QualifiedName:
            return;
        default:
            const ensureNever: never = value;
    }
}

export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;

/* istanbul ignore next */
function objectLiteralElementLikeAliasValidation() {
    const value: ts.ObjectLiteralElementLike = null as any;
    switch (value.kind) {
        case ts.SyntaxKind.PropertyAssignment:
        case ts.SyntaxKind.ShorthandPropertyAssignment:
        case ts.SyntaxKind.SpreadAssignment:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.SetAccessor:
        case ts.SyntaxKind.GetAccessor:
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
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.DefaultClause:
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
        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.QualifiedName:
        case ts.SyntaxKind.ExternalModuleReference:
            return;
        default:
            const ensureNever: never = value;
    }
}
