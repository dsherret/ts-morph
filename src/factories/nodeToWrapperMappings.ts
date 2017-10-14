import * as ts from "typescript";
// they need to be individually imported instead of using a namespace import so that this works with the `declaration: true` compiler argument
import {ArrayLiteralExpression, CallExpression, SourceFile, ClassDeclaration, ConstructorDeclaration, ConstructSignatureDeclaration, Decorator,
    EnumDeclaration, EnumMember, ExportDeclaration, ExportSpecifier, ExpressionWithTypeArguments, FunctionDeclaration, GetAccessorDeclaration,
    HeritageClause, Identifier, ImportDeclaration, ImportSpecifier, InterfaceDeclaration, MethodDeclaration, MethodSignature, NamespaceDeclaration,
    Expression, ParameterDeclaration, PropertyAccessExpression, PropertyDeclaration, PropertySignature, QualifiedName, SetAccessorDeclaration, TypeAliasDeclaration,
    TypeParameterDeclaration, TypeReferenceNode, VariableDeclaration, VariableDeclarationList, VariableStatement, JSDoc} from "./../compiler";

// when changing this, make sure to run `npm run code-generate`.
// that will automatically update all other parts of the application that need to be updated when this changes.

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
    [ts.SyntaxKind.PropertyAccessExpression]: PropertyAccessExpression,
    [ts.SyntaxKind.PropertyDeclaration]: PropertyDeclaration,
    [ts.SyntaxKind.PropertySignature]: PropertySignature,
    [ts.SyntaxKind.QualifiedName]: QualifiedName,
    [ts.SyntaxKind.FirstNode]: QualifiedName,
    [ts.SyntaxKind.SetAccessor]: SetAccessorDeclaration,
    [ts.SyntaxKind.TypeAliasDeclaration]: TypeAliasDeclaration,
    [ts.SyntaxKind.TypeParameter]: TypeParameterDeclaration,
    [ts.SyntaxKind.TypeReference]: TypeReferenceNode,
    [ts.SyntaxKind.VariableDeclaration]: VariableDeclaration,
    [ts.SyntaxKind.VariableDeclarationList]: VariableDeclarationList,
    [ts.SyntaxKind.VariableStatement]: VariableStatement,
    [ts.SyntaxKind.JSDocComment]: JSDoc
};
