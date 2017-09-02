import * as ts from "typescript";
import {ArrayLiteralExpression, CallExpression, SourceFile, ClassDeclaration, ConstructorDeclaration, ConstructSignatureDeclaration, Decorator,
    EnumDeclaration, EnumMember, ExportDeclaration, ExportSpecifier, ExpressionWithTypeArguments, FunctionDeclaration, GetAccessorDeclaration,
    HeritageClause, Identifier, ImportDeclaration, ImportSpecifier, InterfaceDeclaration, MethodDeclaration, MethodSignature, NamespaceDeclaration,
    Expression, ParameterDeclaration, PropertyDeclaration, PropertySignature, SetAccessorDeclaration, TypeAliasDeclaration, TypeParameterDeclaration,
    VariableDeclaration, VariableDeclarationList, VariableStatement, JSDoc} from "./../compiler";

// they need to be individually imported instead of using a namespace import so that this works with the `declaration: true` compiler argument

export const nodeToWrapperMappings = {
    [ts.SyntaxKind.SourceFile]: SourceFile,
    [ts.SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpression,
    [ts.SyntaxKind.CallExpression]: CallExpression,
    [ts.SyntaxKind.ClassDeclaration]: ClassDeclaration,
    [ts.SyntaxKind.Constructor]: ConstructorDeclaration,
    [ts.SyntaxKind.ConstructSignature]: ConstructSignatureDeclaration,
    [ts.SyntaxKind.Decorator]: Decorator,
    [ts.SyntaxKind.EnumDeclaration]: EnumDeclaration,
    [ts.SyntaxKind.EnumMember]: EnumMember,
    [ts.SyntaxKind.ExportDeclaration]: ExportDeclaration,
    [ts.SyntaxKind.ExportSpecifier]: ExportSpecifier,
    [ts.SyntaxKind.ExpressionWithTypeArguments]: ExpressionWithTypeArguments,
    [ts.SyntaxKind.FunctionDeclaration]: FunctionDeclaration,
    [ts.SyntaxKind.GetAccessor]: GetAccessorDeclaration,
    [ts.SyntaxKind.HeritageClause]: HeritageClause,
    [ts.SyntaxKind.Identifier]: Identifier,
    [ts.SyntaxKind.ImportDeclaration]: ImportDeclaration,
    [ts.SyntaxKind.ImportSpecifier]: ImportSpecifier,
    [ts.SyntaxKind.InterfaceDeclaration]: InterfaceDeclaration,
    [ts.SyntaxKind.MethodDeclaration]: MethodDeclaration,
    [ts.SyntaxKind.MethodSignature]: MethodSignature,
    [ts.SyntaxKind.ModuleDeclaration]: NamespaceDeclaration,
    [ts.SyntaxKind.NumericLiteral]: Expression,
    [ts.SyntaxKind.Parameter]: ParameterDeclaration,
    [ts.SyntaxKind.PropertyDeclaration]: PropertyDeclaration,
    [ts.SyntaxKind.PropertySignature]: PropertySignature,
    [ts.SyntaxKind.SetAccessor]: SetAccessorDeclaration,
    [ts.SyntaxKind.TypeAliasDeclaration]: TypeAliasDeclaration,
    [ts.SyntaxKind.TypeParameter]: TypeParameterDeclaration,
    [ts.SyntaxKind.VariableDeclaration]: VariableDeclaration,
    [ts.SyntaxKind.VariableDeclarationList]: VariableDeclarationList,
    [ts.SyntaxKind.VariableStatement]: VariableStatement,
    [ts.SyntaxKind.JSDocComment]: JSDoc
};
