/* ts-lint:disable */
// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate

import * as compiler from "./../compiler";
import * as structures from "./../structures";
import * as fillFuncs from "./fillMixinFunctions";

export function fillClassDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.ClassDeclaration, structure: structures.ClassDeclarationStructure) {
    fillFuncs.fillImplementsClauseableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillDecoratableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillTypeParameteredNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillExportableNodeFromStructure(sourceFile, node, structure);
}

export function fillConstructorDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.ConstructorDeclaration, structure: structures.ConstructorDeclarationStructure) {
    fillFuncs.fillScopedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillFunctionLikeDeclarationFromStructure(sourceFile, node, structure);
}

export function fillGetAccessorDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.GetAccessorDeclaration, structure: structures.GetAccessorDeclarationStructure) {
    fillFuncs.fillDecoratableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillScopedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillStaticableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillFunctionLikeDeclarationFromStructure(sourceFile, node, structure);
}

export function fillMethodDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.MethodDeclaration, structure: structures.MethodDeclarationStructure) {
    fillFuncs.fillDecoratableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillScopedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillStaticableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAsyncableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillGeneratorableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillFunctionLikeDeclarationFromStructure(sourceFile, node, structure);
}

export function fillPropertyDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.PropertyDeclaration, structure: structures.PropertyDeclarationStructure) {
    fillFuncs.fillDecoratableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillScopedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillStaticableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillReadonlyableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillQuestionTokenableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillTypedNodeFromStructure(sourceFile, node, structure);
}

export function fillSetAccessorDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.SetAccessorDeclaration, structure: structures.SetAccessorDeclarationStructure) {
    fillFuncs.fillDecoratableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAbstractableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillScopedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillStaticableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillFunctionLikeDeclarationFromStructure(sourceFile, node, structure);
}

export function fillEnumDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.EnumDeclaration, structure: structures.EnumDeclarationStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillExportableNodeFromStructure(sourceFile, node, structure);
}

export function fillEnumMemberFromStructure(sourceFile: compiler.SourceFile, node: compiler.EnumMember, structure: structures.EnumMemberStructure) {
    fillFuncs.fillFollowingCommableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(sourceFile, node, structure);
}

export function fillSourceFileFromStructure(sourceFile: compiler.SourceFile, node: compiler.SourceFile, structure: structures.SourceFileStructure) {
    fillFuncs.fillStatementedNodeFromStructure(sourceFile, node, structure);
}

export function fillFunctionDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.FunctionDeclaration, structure: structures.FunctionDeclarationStructure) {
    fillFuncs.fillAsyncableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillGeneratorableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillFunctionLikeDeclarationFromStructure(sourceFile, node, structure);
    fillFuncs.fillStatementedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillExportableNodeFromStructure(sourceFile, node, structure);
}

export function fillParameterDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.ParameterDeclaration, structure: structures.ParameterDeclarationStructure) {
    fillFuncs.fillDecoratableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillScopeableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillReadonlyableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillTypedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(sourceFile, node, structure);
}

export function fillInterfaceDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.InterfaceDeclaration, structure: structures.InterfaceDeclarationStructure) {
    fillFuncs.fillExtendsClauseableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillTypeParameteredNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillExportableNodeFromStructure(sourceFile, node, structure);
}

export function fillMethodSignatureFromStructure(sourceFile: compiler.SourceFile, node: compiler.MethodSignature, structure: structures.MethodSignatureStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillQuestionTokenableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillSignaturedDeclarationFromStructure(sourceFile, node, structure);
}

export function fillPropertySignatureFromStructure(sourceFile: compiler.SourceFile, node: compiler.PropertySignature, structure: structures.PropertySignatureStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillReadonlyableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillQuestionTokenableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillTypedNodeFromStructure(sourceFile, node, structure);
}

export function fillNamespaceDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.NamespaceDeclaration, structure: structures.NamespaceDeclarationStructure) {
    fillFuncs.fillStatementedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillExportableNodeFromStructure(sourceFile, node, structure);
}

export function fillTypeAliasDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.TypeAliasDeclaration, structure: structures.TypeAliasDeclarationStructure) {
    fillFuncs.fillTypeParameteredNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillTypedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillExportableNodeFromStructure(sourceFile, node, structure);
}

export function fillTypeParameterDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.TypeParameterDeclaration, structure: structures.TypeParameterDeclarationStructure) {
    fillFuncs.fillFollowingCommableNodeFromStructure(sourceFile, node, structure);
}

export function fillVariableDeclarationFromStructure(sourceFile: compiler.SourceFile, node: compiler.VariableDeclaration, structure: structures.VariableDeclarationStructure) {
    fillFuncs.fillTypedNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillInitializerExpressionableNodeFromStructure(sourceFile, node, structure);
}

export function fillVariableStatementFromStructure(sourceFile: compiler.SourceFile, node: compiler.VariableStatement, structure: structures.VariableStatementStructure) {
    fillFuncs.fillDocumentationableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillAmbientableNodeFromStructure(sourceFile, node, structure);
    fillFuncs.fillExportableNodeFromStructure(sourceFile, node, structure);
}
