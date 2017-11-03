import * as ts from "typescript";
import * as compiler from "./../compiler";

// when changing this, make sure to run `npm run code-generate`.
// that will automatically update all other parts of the application that need to be updated when this changes.

// using an "any" type here because I couldn't figure out a way of getting the typescript compiler to understand this
export const nodeToWrapperMappings: { [key: number]: any } = {
    [ts.SyntaxKind.SourceFile]: compiler.SourceFile,
    [ts.SyntaxKind.ArrayLiteralExpression]: compiler.ArrayLiteralExpression,
    [ts.SyntaxKind.CallExpression]: compiler.CallExpression,
    [ts.SyntaxKind.ClassDeclaration]: compiler.ClassDeclaration,
    [ts.SyntaxKind.Constructor]: compiler.ConstructorDeclaration,
    [ts.SyntaxKind.ConstructSignature]: compiler.ConstructSignatureDeclaration,
    [ts.SyntaxKind.Decorator]: compiler.Decorator,
    [ts.SyntaxKind.EnumDeclaration]: compiler.EnumDeclaration,
    [ts.SyntaxKind.EnumMember]: compiler.EnumMember,
    [ts.SyntaxKind.ExportDeclaration]: compiler.ExportDeclaration,
    [ts.SyntaxKind.ExportSpecifier]: compiler.ExportSpecifier,
    [ts.SyntaxKind.ExpressionWithTypeArguments]: compiler.ExpressionWithTypeArguments,
    [ts.SyntaxKind.FunctionDeclaration]: compiler.FunctionDeclaration,
    [ts.SyntaxKind.GetAccessor]: compiler.GetAccessorDeclaration,
    [ts.SyntaxKind.HeritageClause]: compiler.HeritageClause,
    [ts.SyntaxKind.Identifier]: compiler.Identifier,
    [ts.SyntaxKind.ImportDeclaration]: compiler.ImportDeclaration,
    [ts.SyntaxKind.ImportSpecifier]: compiler.ImportSpecifier,
    [ts.SyntaxKind.InterfaceDeclaration]: compiler.InterfaceDeclaration,
    [ts.SyntaxKind.MethodDeclaration]: compiler.MethodDeclaration,
    [ts.SyntaxKind.MethodSignature]: compiler.MethodSignature,
    [ts.SyntaxKind.ModuleDeclaration]: compiler.NamespaceDeclaration,
    [ts.SyntaxKind.NumericLiteral]: compiler.Expression,
    [ts.SyntaxKind.Parameter]: compiler.ParameterDeclaration,
    [ts.SyntaxKind.PropertyAccessExpression]: compiler.PropertyAccessExpression,
    [ts.SyntaxKind.PropertyDeclaration]: compiler.PropertyDeclaration,
    [ts.SyntaxKind.PropertySignature]: compiler.PropertySignature,
    [ts.SyntaxKind.QualifiedName]: compiler.QualifiedName,
    [ts.SyntaxKind.FirstNode]: compiler.QualifiedName,
    [ts.SyntaxKind.SetAccessor]: compiler.SetAccessorDeclaration,
    [ts.SyntaxKind.TypeAliasDeclaration]: compiler.TypeAliasDeclaration,
    [ts.SyntaxKind.TypeParameter]: compiler.TypeParameterDeclaration,
    [ts.SyntaxKind.TypeReference]: compiler.TypeReferenceNode,
    [ts.SyntaxKind.VariableDeclaration]: compiler.VariableDeclaration,
    [ts.SyntaxKind.VariableDeclarationList]: compiler.VariableDeclarationList,
    [ts.SyntaxKind.VariableStatement]: compiler.VariableStatement,
    [ts.SyntaxKind.JSDocComment]: compiler.JSDoc
};
