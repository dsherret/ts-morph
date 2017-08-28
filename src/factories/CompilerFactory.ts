import * as ts from "typescript";
import * as compiler from "./../compiler";
import * as errors from "./../errors";
import {KeyValueCache, Logger, FileUtils, EventContainer} from "./../utils";
import {GlobalContainer} from "./../GlobalContainer";
import {createWrappedNode} from "./../createWrappedNode";

/**
 * Factory for creating compiler wrappers.
 * @internal
 */
export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, compiler.SourceFile>();
    private readonly normalizedDirectories = new Set<string>();
    private readonly nodeCache = new KeyValueCache<ts.Node, compiler.Node>();
    private readonly sourceFileAddedEventContainer = new EventContainer<{ addedSourceFile: compiler.SourceFile; }>();

    /**
     * Initializes a new instance of CompilerFactory.
     * @param global - Global container.
     */
    constructor(private readonly global: GlobalContainer) {
    }

    /**
     * Occurs when a source file is added to the cache.
     * @param subscription - Subscripton.
     */
    onSourceFileAdded(subscription: (arg: { addedSourceFile: compiler.SourceFile; }) => void) {
        this.sourceFileAddedEventContainer.subscribe(subscription);
    }

    /**
     * Creates a source file from a file path and text.
     * Adds it to the cache.
     * @param filePath - File path for the source file.
     * @param sourceText - Text to create the source file with.
     */
    addSourceFileFromText(filePath: string, sourceText: string) {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        if (this.containsSourceFileAtPath(absoluteFilePath))
            throw new errors.InvalidOperationError(`A source file already exists at the provided file path: ${absoluteFilePath}`);
        const compilerSourceFile = ts.createSourceFile(absoluteFilePath, sourceText, this.global.manipulationSettings.getScriptTarget(), true);
        return this.getSourceFile(compilerSourceFile);
    }

    /**
     * Creates a temporary source file that won't be added to the language service.
     * @param sourceText - Text to create the source file with.
     * @param filePath - File path to use.
     * @returns Wrapped source file.
     */
    createTempSourceFileFromText(sourceText: string, filePath = "tsSimpleAstTempFile.ts") {
        const compilerSourceFile = ts.createSourceFile(filePath, sourceText, this.global.manipulationSettings.getScriptTarget(), true);
        const sourceFile = new compiler.SourceFile(this.global, compilerSourceFile);
        this.nodeCache.set(compilerSourceFile, sourceFile);
        return sourceFile;
    }

    /**
     * Gets a source file from a file path. Will use the file path cache if the file exists.
     * @param filePath - File path to get the file from.
     */
    getSourceFileFromFilePath(filePath: string): compiler.SourceFile | undefined {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        let sourceFile = this.sourceFileCacheByFilePath.get(absoluteFilePath);
        if (sourceFile == null) {
            if (this.global.fileSystem.fileExists(absoluteFilePath)) {
                Logger.log(`Loading file: ${absoluteFilePath}`);
                sourceFile = this.addSourceFileFromText(absoluteFilePath, this.global.fileSystem.readFile(absoluteFilePath));
                sourceFile.setIsSaved(true); // source files loaded from the disk are saved to start with
            }

            if (sourceFile != null) {
                // ensure these are added to the ast
                sourceFile.getReferencedFiles();
                sourceFile.getTypeReferenceDirectives();
            }
        }

        return sourceFile;
    }

    /**
     * Gets if the internal cache contains a source file at a specific file path.
     * @param filePath - File path to check.
     */
    containsSourceFileAtPath(filePath: string) {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        return this.sourceFileCacheByFilePath.get(absoluteFilePath) != null;
    }

    /**
     * Gets if the internal cache contains a source file with the specified directory path.
     * @param dirPath - Directory path to check.
     */
    containsFileInDirectory(dirPath: string) {
        const normalizedDirPath = FileUtils.getStandardizedAbsolutePath(dirPath);
        return this.normalizedDirectories.has(normalizedDirPath);
    }

    /**
     * Gets the source file for a node.
     * @param compilerNode - Compiler node to get the source file of.
     */
    getSourceFileForNode(compilerNode: ts.Node) {
        let currentNode = compilerNode;
        while (currentNode.kind !== ts.SyntaxKind.SourceFile) {
            if (currentNode.parent == null)
                throw new errors.NotImplementedError("Could not find node source file.");
            currentNode = currentNode.parent;
        }
        return this.getSourceFile(currentNode as ts.SourceFile);
    }

    /**
     * Gets a wrapped compiler type based on the node's kind.
     * For example, an enum declaration will be returned a wrapped enum declaration.
     * @param node - Node to get the wrapped object from.
     */
    getNodeFromCompilerNode(compilerNode: ts.Node, sourceFile: compiler.SourceFile): compiler.Node {
        // todo: investigate if it would be worth it to change this to use a map
        switch (compilerNode.kind) {
            case ts.SyntaxKind.SourceFile:
                return this.getSourceFile(compilerNode as ts.SourceFile);
            case ts.SyntaxKind.ArrayLiteralExpression:
                return this.getArrayLiteralExpression(compilerNode as ts.ArrayLiteralExpression, sourceFile);
            case ts.SyntaxKind.CallExpression:
                return this.getCallExpression(compilerNode as ts.CallExpression, sourceFile);
            case ts.SyntaxKind.ClassDeclaration:
                return this.getClassDeclaration(compilerNode as ts.ClassDeclaration, sourceFile);
            case ts.SyntaxKind.Constructor:
                return this.getConstructorDeclaration(compilerNode as ts.ConstructorDeclaration, sourceFile);
            case ts.SyntaxKind.ConstructSignature:
                return this.getConstructSignatureDeclaration(compilerNode as ts.ConstructSignatureDeclaration, sourceFile);
            case ts.SyntaxKind.Decorator:
                return this.getDecorator(compilerNode as ts.Decorator, sourceFile);
            case ts.SyntaxKind.EnumDeclaration:
                return this.getEnumDeclaration(compilerNode as ts.EnumDeclaration, sourceFile);
            case ts.SyntaxKind.EnumMember:
                return this.getEnumMember(compilerNode as ts.EnumMember, sourceFile);
            case ts.SyntaxKind.ExportDeclaration:
                return this.getExportDeclaration(compilerNode as ts.ExportDeclaration, sourceFile);
            case ts.SyntaxKind.ExportSpecifier:
                return this.getExportSpecifier(compilerNode as ts.ExportSpecifier, sourceFile);
            case ts.SyntaxKind.ExpressionWithTypeArguments:
                return this.getExpressionWithTypeArguments(compilerNode as ts.ExpressionWithTypeArguments, sourceFile);
            case ts.SyntaxKind.FunctionDeclaration:
                return this.getFunctionDeclaration(compilerNode as ts.FunctionDeclaration, sourceFile);
            case ts.SyntaxKind.GetAccessor:
                return this.getGetAccessorDeclaration(compilerNode as ts.GetAccessorDeclaration, sourceFile);
            case ts.SyntaxKind.HeritageClause:
                return this.getHeritageClause(compilerNode as ts.HeritageClause, sourceFile);
            case ts.SyntaxKind.Identifier:
                return this.getIdentifier(compilerNode as ts.Identifier, sourceFile);
            case ts.SyntaxKind.ImportDeclaration:
                return this.getImportDeclaration(compilerNode as ts.ImportDeclaration, sourceFile);
            case ts.SyntaxKind.ImportSpecifier:
                return this.getImportSpecifier(compilerNode as ts.ImportSpecifier, sourceFile);
            case ts.SyntaxKind.InterfaceDeclaration:
                return this.getInterfaceDeclaration(compilerNode as ts.InterfaceDeclaration, sourceFile);
            case ts.SyntaxKind.MethodDeclaration:
                return this.getMethodDeclaration(compilerNode as ts.MethodDeclaration, sourceFile);
            case ts.SyntaxKind.MethodSignature:
                return this.getMethodSignature(compilerNode as ts.MethodSignature, sourceFile);
            case ts.SyntaxKind.ModuleDeclaration:
                return this.getNamespaceDeclaration(compilerNode as ts.NamespaceDeclaration, sourceFile);
            case ts.SyntaxKind.NumericLiteral:
                return this.getExpression(compilerNode as ts.Expression, sourceFile);
            case ts.SyntaxKind.Parameter:
                return this.getParameterDeclaration(compilerNode as ts.ParameterDeclaration, sourceFile);
            case ts.SyntaxKind.PropertyDeclaration:
                return this.getPropertyDeclaration(compilerNode as ts.PropertyDeclaration, sourceFile);
            case ts.SyntaxKind.PropertySignature:
                return this.getPropertySignature(compilerNode as ts.PropertySignature, sourceFile);
            case ts.SyntaxKind.SetAccessor:
                return this.getSetAccessorDeclaration(compilerNode as ts.SetAccessorDeclaration, sourceFile);
            case ts.SyntaxKind.TypeAliasDeclaration:
                return this.getTypeAliasDeclaration(compilerNode as ts.TypeAliasDeclaration, sourceFile);
            case ts.SyntaxKind.TypeParameter:
                return this.getTypeParameterDeclaration(compilerNode as ts.TypeParameterDeclaration, sourceFile);
            case ts.SyntaxKind.VariableDeclaration:
                return this.getVariableDeclaration(compilerNode as ts.VariableDeclaration, sourceFile);
            case ts.SyntaxKind.VariableDeclarationList:
                return this.getVariableDeclarationList(compilerNode as ts.VariableDeclarationList, sourceFile);
            case ts.SyntaxKind.VariableStatement:
                return this.getVariableStatement(compilerNode as ts.VariableStatement, sourceFile);
            case ts.SyntaxKind.JSDocComment:
                return this.getJSDoc(compilerNode as ts.JSDoc, sourceFile);
            default:
                return this.nodeCache.getOrCreate<compiler.Node>(compilerNode, () => new compiler.Node(this.global, compilerNode, sourceFile));
        }
    }

    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     */
    getSourceFile(compilerSourceFile: ts.SourceFile): compiler.SourceFile {
        return this.nodeCache.getOrCreate<compiler.SourceFile>(compilerSourceFile, () => {
            const sourceFile = new compiler.SourceFile(this.global, compilerSourceFile);
            this.sourceFileCacheByFilePath.set(sourceFile.getFilePath(), sourceFile);

            // add to list of directories
            const normalizedDir = FileUtils.getStandardizedAbsolutePath(FileUtils.getDirName(sourceFile.getFilePath()));
            if (!this.normalizedDirectories.has(normalizedDir))
                this.normalizedDirectories.add(normalizedDir);

            // fire the event
            this.sourceFileAddedEventContainer.fire({
                addedSourceFile: sourceFile
            });

            return sourceFile;
        });
    }

    /**
     * Gets a wrapped type from a compiler type.
     * @param type - Compiler type.
     */
    getType(type: ts.Type): compiler.Type {
        return new compiler.Type(this.global, type);
    }

    /**
     * Gets a wrapped signature from a compiler signature.
     * @param signature - Compiler signature.
     */
    getSignature(signature: ts.Signature): compiler.Signature {
        return new compiler.Signature(this.global, signature);
    }

    /**
     * Gets a wrapped symbol from a compiler symbol.
     * @param symbol - Compiler symbol.
     */
    getSymbol(symbol: ts.Symbol): compiler.Symbol {
        return new compiler.Symbol(this.global, symbol);
    }

    /**
     * Gets a wrapped diagnostic from a compiler diagnostic.
     * @param diagnostic - Compiler diagnostic.
     */
    getDiagnostic(diagnostic: ts.Diagnostic): compiler.Diagnostic {
        return new compiler.Diagnostic(this.global, diagnostic);
    }

    /**
     * Gets a wrapped diagnostic message chain from a compiler diagnostic message chain.
     * @param diagnostic - Compiler diagnostic message chain.
     */
    getDiagnosticMessageChain(diagnosticMessageChain: ts.DiagnosticMessageChain): compiler.DiagnosticMessageChain {
        return new compiler.DiagnosticMessageChain(this.global, diagnosticMessageChain);
    }

    /**
     * Replaces a compiler node in the cache.
     * @param oldNode - Old node to remove.
     * @param newNode - New node to use.
     */
    replaceCompilerNode(oldNode: ts.Node | compiler.Node, newNode: ts.Node) {
        const nodeToReplace = oldNode instanceof compiler.Node ? oldNode.compilerNode : oldNode;
        const node = oldNode instanceof compiler.Node ? oldNode : this.nodeCache.get(oldNode);

        this.nodeCache.replaceKey(nodeToReplace, newNode);

        if (node != null)
            node.replaceCompilerNode(newNode);
    }

    /**
     * Removes a node from the cache.
     * @param node - Node to remove.
     */
    removeNodeFromCache(node: compiler.Node) {
        const compilerNode = node.compilerNode;
        this.nodeCache.removeByKey(compilerNode);

        if (compilerNode.kind === ts.SyntaxKind.SourceFile) {
            const sourceFile = compilerNode as ts.SourceFile;
            this.sourceFileCacheByFilePath.removeByKey(sourceFile.fileName);
        }
    }

    private getArrayLiteralExpression(node: ts.ArrayLiteralExpression, sourceFile: compiler.SourceFile): compiler.ArrayLiteralExpression {
        return this.nodeCache.getOrCreate<compiler.ArrayLiteralExpression>(node, () => new compiler.ArrayLiteralExpression(this.global, node, sourceFile));
    }

    private getCallExpression(node: ts.CallExpression, sourceFile: compiler.SourceFile): compiler.CallExpression {
        return this.nodeCache.getOrCreate<compiler.CallExpression>(node, () => new compiler.CallExpression(this.global, node, sourceFile));
    }

    private getClassDeclaration(classDeclaration: ts.ClassDeclaration, sourceFile: compiler.SourceFile): compiler.ClassDeclaration {
        return this.nodeCache.getOrCreate<compiler.ClassDeclaration>(classDeclaration, () => new compiler.ClassDeclaration(this.global, classDeclaration, sourceFile));
    }

    private getConstructorDeclaration(constructorDeclaration: ts.ConstructorDeclaration, sourceFile: compiler.SourceFile): compiler.ConstructorDeclaration {
        return this.nodeCache.getOrCreate<compiler.ConstructorDeclaration>(constructorDeclaration,
            () => new compiler.ConstructorDeclaration(this.global, constructorDeclaration, sourceFile));
    }

    private getConstructSignatureDeclaration(constructSignature: ts.ConstructSignatureDeclaration, sourceFile: compiler.SourceFile): compiler.ConstructSignatureDeclaration {
        return this.nodeCache.getOrCreate<compiler.ConstructSignatureDeclaration>(constructSignature,
            () => new compiler.ConstructSignatureDeclaration(this.global, constructSignature, sourceFile));
    }

    private getDecorator(decorator: ts.Decorator, sourceFile: compiler.SourceFile): compiler.Decorator {
        return this.nodeCache.getOrCreate<compiler.Decorator>(decorator, () => new compiler.Decorator(this.global, decorator, sourceFile));
    }

    private getEnumDeclaration(enumDeclaration: ts.EnumDeclaration, sourceFile: compiler.SourceFile): compiler.EnumDeclaration {
        return this.nodeCache.getOrCreate<compiler.EnumDeclaration>(enumDeclaration, () => new compiler.EnumDeclaration(this.global, enumDeclaration, sourceFile));
    }

    private getEnumMember(enumMemberDeclaration: ts.EnumMember, sourceFile: compiler.SourceFile): compiler.EnumMember {
        return this.nodeCache.getOrCreate<compiler.EnumMember>(enumMemberDeclaration, () => new compiler.EnumMember(this.global, enumMemberDeclaration, sourceFile));
    }

    private getExportDeclaration(declaration: ts.ExportDeclaration, sourceFile: compiler.SourceFile): compiler.ExportDeclaration {
        return this.nodeCache.getOrCreate<compiler.ExportDeclaration>(declaration, () => new compiler.ExportDeclaration(this.global, declaration, sourceFile));
    }

    private getExportSpecifier(specifier: ts.ExportSpecifier, sourceFile: compiler.SourceFile): compiler.ExportSpecifier {
        return this.nodeCache.getOrCreate<compiler.ExportSpecifier>(specifier, () => new compiler.ExportSpecifier(this.global, specifier, sourceFile));
    }

    private getExpressionWithTypeArguments(node: ts.ExpressionWithTypeArguments, sourceFile: compiler.SourceFile): compiler.ExpressionWithTypeArguments {
        return this.nodeCache.getOrCreate<compiler.ExpressionWithTypeArguments>(node, () => new compiler.ExpressionWithTypeArguments(this.global, node, sourceFile));
    }

    private getFunctionDeclaration(functionDeclaration: ts.FunctionDeclaration, sourceFile: compiler.SourceFile): compiler.FunctionDeclaration {
        return this.nodeCache.getOrCreate<compiler.FunctionDeclaration>(functionDeclaration, () => new compiler.FunctionDeclaration(this.global, functionDeclaration, sourceFile));
    }

    private getGetAccessorDeclaration(getAccessor: ts.GetAccessorDeclaration, sourceFile: compiler.SourceFile): compiler.GetAccessorDeclaration {
        return this.nodeCache.getOrCreate<compiler.GetAccessorDeclaration>(getAccessor, () => new compiler.GetAccessorDeclaration(this.global, getAccessor, sourceFile));
    }

    private getHeritageClause(heritageClause: ts.HeritageClause, sourceFile: compiler.SourceFile): compiler.HeritageClause {
        return this.nodeCache.getOrCreate<compiler.HeritageClause>(heritageClause, () => new compiler.HeritageClause(this.global, heritageClause, sourceFile));
    }

    private getInterfaceDeclaration(interfaceDeclaration: ts.InterfaceDeclaration, sourceFile: compiler.SourceFile): compiler.InterfaceDeclaration {
        return this.nodeCache.getOrCreate<compiler.InterfaceDeclaration>(interfaceDeclaration, () => new compiler.InterfaceDeclaration(this.global, interfaceDeclaration, sourceFile));
    }

    private getMethodDeclaration(methodDeclaration: ts.MethodDeclaration, sourceFile: compiler.SourceFile): compiler.MethodDeclaration {
        return this.nodeCache.getOrCreate<compiler.MethodDeclaration>(methodDeclaration, () => new compiler.MethodDeclaration(this.global, methodDeclaration, sourceFile));
    }

    private getMethodSignature(methodSignature: ts.MethodSignature, sourceFile: compiler.SourceFile): compiler.MethodSignature {
        return this.nodeCache.getOrCreate<compiler.MethodSignature>(methodSignature, () => new compiler.MethodSignature(this.global, methodSignature, sourceFile));
    }

    private getNamespaceDeclaration(namespaceDeclaration: ts.NamespaceDeclaration, sourceFile: compiler.SourceFile): compiler.NamespaceDeclaration {
        return this.nodeCache.getOrCreate<compiler.NamespaceDeclaration>(namespaceDeclaration, () => new compiler.NamespaceDeclaration(this.global, namespaceDeclaration, sourceFile));
    }

    private getParameterDeclaration(parameterDeclaration: ts.ParameterDeclaration, sourceFile: compiler.SourceFile): compiler.ParameterDeclaration {
        return this.nodeCache.getOrCreate<compiler.ParameterDeclaration>(parameterDeclaration, () => new compiler.ParameterDeclaration(this.global, parameterDeclaration, sourceFile));
    }

    private getPropertyDeclaration(propertyDeclaration: ts.PropertyDeclaration, sourceFile: compiler.SourceFile): compiler.PropertyDeclaration {
        return this.nodeCache.getOrCreate<compiler.PropertyDeclaration>(propertyDeclaration, () => new compiler.PropertyDeclaration(this.global, propertyDeclaration, sourceFile));
    }

    private getPropertySignature(propertySignature: ts.PropertySignature, sourceFile: compiler.SourceFile): compiler.PropertySignature {
        return this.nodeCache.getOrCreate<compiler.PropertySignature>(propertySignature, () => new compiler.PropertySignature(this.global, propertySignature, sourceFile));
    }

    private getSetAccessorDeclaration(setAccessor: ts.SetAccessorDeclaration, sourceFile: compiler.SourceFile): compiler.SetAccessorDeclaration {
        return this.nodeCache.getOrCreate<compiler.SetAccessorDeclaration>(setAccessor, () => new compiler.SetAccessorDeclaration(this.global, setAccessor, sourceFile));
    }

    private getTypeAliasDeclaration(typeAliasDeclaration: ts.TypeAliasDeclaration, sourceFile: compiler.SourceFile): compiler.TypeAliasDeclaration {
        return this.nodeCache.getOrCreate<compiler.TypeAliasDeclaration>(typeAliasDeclaration, () => new compiler.TypeAliasDeclaration(this.global, typeAliasDeclaration, sourceFile));
    }

    private getVariableDeclarationList(declarationList: ts.VariableDeclarationList, sourceFile: compiler.SourceFile): compiler.VariableDeclarationList {
        return this.nodeCache.getOrCreate<compiler.VariableDeclarationList>(declarationList, () => new compiler.VariableDeclarationList(this.global, declarationList, sourceFile));
    }

    private getVariableStatement(statement: ts.VariableStatement, sourceFile: compiler.SourceFile): compiler.VariableStatement {
        return this.nodeCache.getOrCreate<compiler.VariableStatement>(statement, () => new compiler.VariableStatement(this.global, statement, sourceFile));
    }

    private getVariableDeclaration(declaration: ts.VariableDeclaration, sourceFile: compiler.SourceFile): compiler.VariableDeclaration {
        return this.nodeCache.getOrCreate<compiler.VariableDeclaration>(declaration, () => new compiler.VariableDeclaration(this.global, declaration, sourceFile));
    }

    private getJSDoc(declaration: ts.JSDoc, sourceFile: compiler.SourceFile): compiler.JSDoc {
        return this.nodeCache.getOrCreate<compiler.JSDoc>(declaration, () => new compiler.JSDoc(this.global, declaration, sourceFile));
    }

    private getIdentifier(identifier: ts.Identifier, sourceFile: compiler.SourceFile): compiler.Identifier {
        return this.nodeCache.getOrCreate<compiler.Identifier>(identifier, () => new compiler.Identifier(this.global, identifier, sourceFile));
    }

    private getImportDeclaration(importDeclaration: ts.ImportDeclaration, sourceFile: compiler.SourceFile): compiler.ImportDeclaration {
        return this.nodeCache.getOrCreate<compiler.ImportDeclaration>(importDeclaration, () => new compiler.ImportDeclaration(this.global, importDeclaration, sourceFile));
    }

    private getImportSpecifier(importSpecifier: ts.ImportSpecifier, sourceFile: compiler.SourceFile): compiler.ImportSpecifier {
        return this.nodeCache.getOrCreate<compiler.ImportSpecifier>(importSpecifier, () => new compiler.ImportSpecifier(this.global, importSpecifier, sourceFile));
    }

    private getExpression(expression: ts.Expression, sourceFile: compiler.SourceFile): compiler.Expression {
        return this.nodeCache.getOrCreate<compiler.Expression>(expression, () => new compiler.Expression(this.global, expression, sourceFile));
    }

    private getTypeNode(typeNode: ts.TypeNode, sourceFile: compiler.SourceFile): compiler.TypeNode {
        return this.nodeCache.getOrCreate<compiler.TypeNode>(typeNode, () => new compiler.TypeNode(this.global, typeNode, sourceFile));
    }

    private getTypeParameterDeclaration(typeParameterDeclaration: ts.TypeParameterDeclaration, sourceFile: compiler.SourceFile): compiler.TypeParameterDeclaration {
        return this.nodeCache.getOrCreate<compiler.TypeParameterDeclaration>(typeParameterDeclaration,
            () => new compiler.TypeParameterDeclaration(this.global, typeParameterDeclaration, sourceFile));
    }
}
