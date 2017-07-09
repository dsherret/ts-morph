/* tslint:disable */
// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate

import * as compiler from "./../compiler";
import * as structures from "./../structures";
import * as fillFuncs from "./fillMixinFunctions";
import * as fillOnlyFuncs from "./fillOnlyFunctions";

export function fillClassDeclarationFromStructure(node: compiler.ClassDeclaration, structure: structures.ClassDeclarationStructure) {
    fillFuncs.fillImplementsClauseableNodeFromStructure(node, structure);
    fillFuncs.fillDecoratableNodeFromStructure(node, structure);
    fillFuncs.fillTypeParameteredNodeFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(node, structure);
    fillFuncs.fillExportableNodeFromStructure(node, structure);
    fillOnlyFuncs.fillOnlyClassDeclarationFromStructure(node, structure);
}

export function fillConstructorDeclarationFromStructure(node: compiler.ConstructorDeclaration, structure: structures.ConstructorDeclarationStructure) {
    fillFuncs.fillScopedNodeFromStructure(node, structure);
    fillFunctionLikeDeclarationFromStructure(node, structure);
    fillOnlyFuncs.fillOnlyConstructorDeclarationFromStructure(node, structure);
}

export function fillMethodDeclarationFromStructure(node: compiler.MethodDeclaration, structure: structures.MethodDeclarationStructure) {
    fillFuncs.fillDecoratableNodeFromStructure(node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(node, structure);
    fillFuncs.fillScopedNodeFromStructure(node, structure);
    fillFuncs.fillStaticableNodeFromStructure(node, structure);
    fillFuncs.fillAsyncableNodeFromStructure(node, structure);
    fillFuncs.fillGeneratorableNodeFromStructure(node, structure);
    fillFunctionLikeDeclarationFromStructure(node, structure);
    fillOnlyFuncs.fillOnlyMethodDeclarationFromStructure(node, structure);
}

export function fillPropertyDeclarationFromStructure(node: compiler.PropertyDeclaration, structure: structures.PropertyDeclarationStructure) {
    fillFuncs.fillDecoratableNodeFromStructure(node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(node, structure);
    fillFuncs.fillScopedNodeFromStructure(node, structure);
    fillFuncs.fillStaticableNodeFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillReadonlyableNodeFromStructure(node, structure);
    fillFuncs.fillQuestionTokenableNodeFromStructure(node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(node, structure);
    fillFuncs.fillTypedNodeFromStructure(node, structure);
}

export function fillEnumDeclarationFromStructure(node: compiler.EnumDeclaration, structure: structures.EnumDeclarationStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(node, structure);
    fillFuncs.fillExportableNodeFromStructure(node, structure);
    fillOnlyFuncs.fillOnlyEnumDeclarationFromStructure(node, structure);
}

export function fillEnumMemberFromStructure(node: compiler.EnumMember, structure: structures.EnumMemberStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(node, structure);
}

export function fillSourceFileFromStructure(node: compiler.SourceFile, structure: structures.SourceFileStructure) {
    fillFuncs.fillStatementedNodeFromStructure(node, structure);
    fillOnlyFuncs.fillOnlySourceFileFromStructure(node, structure);
}

export function fillFunctionDeclarationFromStructure(node: compiler.FunctionDeclaration, structure: structures.FunctionDeclarationStructure) {
    fillFuncs.fillAsyncableNodeFromStructure(node, structure);
    fillFuncs.fillGeneratorableNodeFromStructure(node, structure);
    fillFunctionLikeDeclarationFromStructure(node, structure);
    fillFuncs.fillStatementedNodeFromStructure(node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(node, structure);
    fillFuncs.fillExportableNodeFromStructure(node, structure);
    fillOnlyFuncs.fillOnlyFunctionDeclarationFromStructure(node, structure);
}

export function fillParameterDeclarationFromStructure(node: compiler.ParameterDeclaration, structure: structures.ParameterDeclarationStructure) {
    fillFuncs.fillQuestionTokenableNodeFromStructure(node, structure);
    fillFuncs.fillDecoratableNodeFromStructure(node, structure);
    fillFuncs.fillScopeableNodeFromStructure(node, structure);
    fillFuncs.fillReadonlyableNodeFromStructure(node, structure);
    fillFuncs.fillTypedNodeFromStructure(node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(node, structure);
}

export function fillConstructSignatureDeclarationFromStructure(node: compiler.ConstructSignatureDeclaration, structure: structures.ConstructSignatureDeclarationStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillSignaturedDeclarationFromStructure(node, structure);
}

export function fillInterfaceDeclarationFromStructure(node: compiler.InterfaceDeclaration, structure: structures.InterfaceDeclarationStructure) {
    fillFuncs.fillExtendsClauseableNodeFromStructure(node, structure);
    fillFuncs.fillTypeParameteredNodeFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(node, structure);
    fillFuncs.fillExportableNodeFromStructure(node, structure);
    fillOnlyFuncs.fillOnlyInterfaceDeclarationFromStructure(node, structure);
}

export function fillMethodSignatureFromStructure(node: compiler.MethodSignature, structure: structures.MethodSignatureStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillQuestionTokenableNodeFromStructure(node, structure);
    fillSignaturedDeclarationFromStructure(node, structure);
}

export function fillPropertySignatureFromStructure(node: compiler.PropertySignature, structure: structures.PropertySignatureStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillReadonlyableNodeFromStructure(node, structure);
    fillFuncs.fillQuestionTokenableNodeFromStructure(node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(node, structure);
    fillFuncs.fillTypedNodeFromStructure(node, structure);
}

export function fillNamespaceDeclarationFromStructure(node: compiler.NamespaceDeclaration, structure: structures.NamespaceDeclarationStructure) {
    fillFuncs.fillStatementedNodeFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(node, structure);
    fillFuncs.fillExportableNodeFromStructure(node, structure);
    fillOnlyFuncs.fillOnlyNamespaceDeclarationFromStructure(node, structure);
}

export function fillTypeAliasDeclarationFromStructure(node: compiler.TypeAliasDeclaration, structure: structures.TypeAliasDeclarationStructure) {
    fillFuncs.fillTypeParameteredNodeFromStructure(node, structure);
    fillFuncs.fillTypedNodeFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(node, structure);
    fillFuncs.fillExportableNodeFromStructure(node, structure);
}

export function fillFunctionLikeDeclarationFromStructure(node: compiler.FunctionLikeDeclaration, structure: structures.FunctionLikeDeclarationStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillSignaturedDeclarationFromStructure(node, structure);
    fillFuncs.fillStatementedNodeFromStructure(node, structure);
}

export function fillSignaturedDeclarationFromStructure(node: compiler.SignaturedDeclaration, structure: structures.SignaturedDeclarationStructure) {
    fillFuncs.fillParameteredNodeFromStructure(node, structure);
    fillFuncs.fillReturnTypedNodeFromStructure(node, structure);
    fillFuncs.fillTypeParameteredNodeFromStructure(node, structure);
}

export function fillConstructorDeclarationOverloadFromStructure(node: compiler.ConstructorDeclaration, structure: structures.ConstructorDeclarationOverloadStructure) {
    fillFuncs.fillScopedNodeFromStructure(node, structure);
    fillSignaturedDeclarationFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
}

export function fillMethodDeclarationOverloadFromStructure(node: compiler.MethodDeclaration, structure: structures.MethodDeclarationOverloadStructure) {
    fillFuncs.fillStaticableNodeFromStructure(node, structure);
    fillFuncs.fillDecoratableNodeFromStructure(node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(node, structure);
    fillFuncs.fillScopedNodeFromStructure(node, structure);
    fillFuncs.fillAsyncableNodeFromStructure(node, structure);
    fillFuncs.fillGeneratorableNodeFromStructure(node, structure);
    fillSignaturedDeclarationFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
}

export function fillFunctionDeclarationOverloadFromStructure(node: compiler.FunctionDeclaration, structure: structures.FunctionDeclarationOverloadStructure) {
    fillSignaturedDeclarationFromStructure(node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(node, structure);
    fillFuncs.fillAsyncableNodeFromStructure(node, structure);
    fillFuncs.fillGeneratorableNodeFromStructure(node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(node, structure);
    fillFuncs.fillExportableNodeFromStructure(node, structure);
}
