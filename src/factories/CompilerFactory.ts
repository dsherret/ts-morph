import * as ts from "typescript";
import * as compiler from "./../compiler";
import * as errors from "./../errors";
import {FileSystemHost} from "./../FileSystemHost";
import {KeyValueCache, Logger, FileUtils} from "./../utils";

/**
 * Factory for creating compiler wrappers.
 * @internal
 */
export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, compiler.SourceFile>();
    private readonly normalizedDirectories = new Set<string>();
    private readonly nodeCache = new KeyValueCache<ts.Node, compiler.Node>();
    private readonly fileNameUsedForTempSourceFile = "tsSimpleAstTemporaryFile.ts";

    /**
     * Initializes a new instance of CompilerFactory.
     * @param fileSystem - Host for reading files.
     * @param languageService - Language service.
     */
    constructor(private readonly fileSystem: FileSystemHost, private readonly languageService: compiler.LanguageService) {
        languageService.setCompilerFactory(this);
    }

    /**
     * Convenience method to get the language service.
     */
    getLanguageService() {
        return this.languageService;
    }

    /**
     * Convenience method to get the type checker.
     */
    getTypeChecker() {
        return this.languageService.getProgram().getTypeChecker();
    }

    /**
     * Convenience method to get the file system host.
     */
    getFileSystemHost() {
        return this.fileSystem;
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
        const compilerSourceFile = ts.createSourceFile(absoluteFilePath, sourceText, this.languageService.getScriptTarget(), true);
        return this.getSourceFile(compilerSourceFile);
    }

    /**
     * Creates a temporary source file that won't be cached or added to the language service.
     * @param sourceText - Text to create the source file with.
     * @param filePath - File path to use.
     * @returns Wrapped source file.
     */
    createTempSourceFileFromText(sourceText: string, filePath = this.fileNameUsedForTempSourceFile) {
        const sourceFile = ts.createSourceFile(filePath, sourceText, this.getLanguageService().getScriptTarget(), true);
        return new compiler.SourceFile(this, sourceFile);
    }

    /**
     * Gets a source file from a file path. Will use the file path cache if the file exists.
     * @param filePath - File path to get the file from.
     */
    getSourceFileFromFilePath(filePath: string): compiler.SourceFile {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        let sourceFile = this.sourceFileCacheByFilePath.get(absoluteFilePath);
        if (sourceFile == null) {
            Logger.log(`Loading file: ${absoluteFilePath}`);
            sourceFile = this.addSourceFileFromText(absoluteFilePath, this.fileSystem.readFile(absoluteFilePath));

            if (sourceFile != null)
                sourceFile.getReferencedFiles(); // fill referenced files
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
     * Gets a wrapped compiler type based on the node's kind.
     * For example, an enum declaration will be returned a wrapped enum declaration.
     * @param node - Node to get the wrapped object from.
     */
    getNodeFromCompilerNode(compilerNode: ts.Node): compiler.Node {
        switch (compilerNode.kind) {
            case ts.SyntaxKind.SourceFile:
                return this.getSourceFile(compilerNode as ts.SourceFile);
            case ts.SyntaxKind.ClassDeclaration:
                return this.getClassDeclaration(compilerNode as ts.ClassDeclaration);
            case ts.SyntaxKind.Constructor:
                return this.getConstructorDeclaration(compilerNode as ts.ConstructorDeclaration);
            case ts.SyntaxKind.Decorator:
                return this.getDecorator(compilerNode as ts.Decorator);
            case ts.SyntaxKind.EnumDeclaration:
                return this.getEnumDeclaration(compilerNode as ts.EnumDeclaration);
            case ts.SyntaxKind.EnumMember:
                return this.getEnumMember(compilerNode as ts.EnumMember);
            case ts.SyntaxKind.ExpressionWithTypeArguments:
                return this.getExpressionWithTypeArguments(compilerNode as ts.ExpressionWithTypeArguments);
            case ts.SyntaxKind.FunctionDeclaration:
                return this.getFunctionDeclaration(compilerNode as ts.FunctionDeclaration);
            case ts.SyntaxKind.GetAccessor:
                return this.getGetAccessorDeclaration(compilerNode as ts.GetAccessorDeclaration);
            case ts.SyntaxKind.HeritageClause:
                return this.getHeritageClause(compilerNode as ts.HeritageClause);
            case ts.SyntaxKind.InterfaceDeclaration:
                return this.getInterfaceDeclaration(compilerNode as ts.InterfaceDeclaration);
            case ts.SyntaxKind.Identifier:
                return this.getIdentifier(compilerNode as ts.Identifier);
            case ts.SyntaxKind.MethodDeclaration:
                return this.getMethodDeclaration(compilerNode as ts.MethodDeclaration);
            case ts.SyntaxKind.PropertyDeclaration:
                return this.getPropertyDeclaration(compilerNode as ts.PropertyDeclaration);
            case ts.SyntaxKind.ModuleDeclaration:
                return this.getNamespaceDeclaration(compilerNode as ts.NamespaceDeclaration);
            case ts.SyntaxKind.NumericLiteral:
                return this.getExpression(compilerNode as ts.Expression);
            case ts.SyntaxKind.Parameter:
                return this.getParameterDeclaration(compilerNode as ts.ParameterDeclaration);
            case ts.SyntaxKind.SetAccessor:
                return this.getSetAccessorDeclaration(compilerNode as ts.SetAccessorDeclaration);
            case ts.SyntaxKind.TypeAliasDeclaration:
                return this.getTypeAliasDeclaration(compilerNode as ts.TypeAliasDeclaration);
            case ts.SyntaxKind.VariableDeclaration:
                return this.getVariableDeclaration(compilerNode as ts.VariableDeclaration);
            case ts.SyntaxKind.VariableDeclarationList:
                return this.getVariableDeclarationList(compilerNode as ts.VariableDeclarationList);
            case ts.SyntaxKind.VariableStatement:
                return this.getVariableStatement(compilerNode as ts.VariableStatement);
            case ts.SyntaxKind.JSDocComment:
                return this.getJSDoc(compilerNode as ts.JSDoc);
            default:
                return this.nodeCache.getOrCreate<compiler.Node>(compilerNode, () => new compiler.Node(this, compilerNode));
        }
    }

    /**
     * Gets a wrapped class declaration from a compiler object.
     * @param classDeclaration - Class declaration compiler object.
     */
    getClassDeclaration(classDeclaration: ts.ClassDeclaration): compiler.ClassDeclaration {
        return this.nodeCache.getOrCreate<compiler.ClassDeclaration>(classDeclaration, () => new compiler.ClassDeclaration(this, classDeclaration));
    }

    /**
     * Gets a wrapped class constructor declaration from a compiler object.
     * @param constructorDeclaration - Constructor declaration compiler object.
     */
    getConstructorDeclaration(constructorDeclaration: ts.ConstructorDeclaration): compiler.ConstructorDeclaration {
        return this.nodeCache.getOrCreate<compiler.ConstructorDeclaration>(constructorDeclaration, () => new compiler.ConstructorDeclaration(this, constructorDeclaration));
    }

    /**
     * Gets a wrapped decorator from a compiler object.
     * @param decorator - Decorator compiler object.
     */
    getDecorator(decorator: ts.Decorator): compiler.Decorator {
        return this.nodeCache.getOrCreate<compiler.Decorator>(decorator, () => new compiler.Decorator(this, decorator));
    }

    /**
     * Gets a wrapped enum declaration from a compiler object.
     * @param enumDeclaration - Enum declaration compiler object.
     */
    getEnumDeclaration(enumDeclaration: ts.EnumDeclaration): compiler.EnumDeclaration {
        return this.nodeCache.getOrCreate<compiler.EnumDeclaration>(enumDeclaration, () => new compiler.EnumDeclaration(this, enumDeclaration));
    }

    /**
     * Gets a wrapped enum member declaration from a compiler object.
     * @param enumMemberDeclaration - Enum member declaration compiler object.
     */
    getEnumMember(enumMemberDeclaration: ts.EnumMember): compiler.EnumMember {
        return this.nodeCache.getOrCreate<compiler.EnumMember>(enumMemberDeclaration, () => new compiler.EnumMember(this, enumMemberDeclaration));
    }

    /**
     * Gets an expression with type arguments from a compiler object.
     * @param expressionWithTypeArguments - Expression with type arguments compiler object.
     */
    getExpressionWithTypeArguments(node: ts.ExpressionWithTypeArguments): compiler.ExpressionWithTypeArguments {
        return this.nodeCache.getOrCreate<compiler.ExpressionWithTypeArguments>(node, () => new compiler.ExpressionWithTypeArguments(this, node));
    }

    /**
     * Gets a wrapped function declaration from a compiler object.
     * @param functionDeclaration - Function declaration compiler object.
     */
    getFunctionDeclaration(functionDeclaration: ts.FunctionDeclaration): compiler.FunctionDeclaration {
        return this.nodeCache.getOrCreate<compiler.FunctionDeclaration>(functionDeclaration, () => new compiler.FunctionDeclaration(this, functionDeclaration));
    }

    /**
     * Gets a wrapped get accessor declaration from a compiler object.
     * @param propertySignature - Get accessor declaration compiler object.
     */
    getGetAccessorDeclaration(getAccessor: ts.GetAccessorDeclaration): compiler.GetAccessorDeclaration {
        return this.nodeCache.getOrCreate<compiler.GetAccessorDeclaration>(getAccessor, () => new compiler.GetAccessorDeclaration(this, getAccessor));
    }

    /**
     * Gets a wrapped heritage clause from a compiler object.
     * @param heritageClause - Heritage clause compiler object.
     */
    getHeritageClause(heritageClause: ts.HeritageClause): compiler.HeritageClause {
        return this.nodeCache.getOrCreate<compiler.HeritageClause>(heritageClause, () => new compiler.HeritageClause(this, heritageClause));
    }

    /**
     * Gets a wrapped interface declaration from a compiler object.
     * @param interfaceDeclaration - Interface declaration compiler object.
     */
    getInterfaceDeclaration(interfaceDeclaration: ts.InterfaceDeclaration): compiler.InterfaceDeclaration {
        return this.nodeCache.getOrCreate<compiler.InterfaceDeclaration>(interfaceDeclaration, () => new compiler.InterfaceDeclaration(this, interfaceDeclaration));
    }

    /**
     * Gets a wrapped class method declaration from a compiler object.
     * @param methodDeclaration - Method declaration compiler object.
     */
    getMethodDeclaration(methodDeclaration: ts.MethodDeclaration): compiler.MethodDeclaration {
        return this.nodeCache.getOrCreate<compiler.MethodDeclaration>(methodDeclaration, () => new compiler.MethodDeclaration(this, methodDeclaration));
    }

    /**
     * Gets a wrapped method signature from a compiler object.
     * @param methodSignature - Method signature compiler object.
     */
    getMethodSignature(methodSignature: ts.MethodSignature): compiler.MethodSignature {
        return this.nodeCache.getOrCreate<compiler.MethodSignature>(methodSignature, () => new compiler.MethodSignature(this, methodSignature));
    }

    /**
     * Gets a wrapped namespace declaration from a compiler object.
     * @param namespaceDeclaration - Namespace declaration compiler object.
     */
    getNamespaceDeclaration(namespaceDeclaration: ts.NamespaceDeclaration): compiler.NamespaceDeclaration {
        return this.nodeCache.getOrCreate<compiler.NamespaceDeclaration>(namespaceDeclaration, () => new compiler.NamespaceDeclaration(this, namespaceDeclaration));
    }

    /**
     * Gets a wrapped parameter declaration from a compiler object.
     * @param parameterDeclaration - Parameter declaration compiler object.
     */
    getParameterDeclaration(parameterDeclaration: ts.ParameterDeclaration): compiler.ParameterDeclaration {
        return this.nodeCache.getOrCreate<compiler.ParameterDeclaration>(parameterDeclaration, () => new compiler.ParameterDeclaration(this, parameterDeclaration));
    }

    /**
     * Gets a wrapped class property declaration from a compiler object.
     * @param propertyDeclaration - Property declaration compiler object.
     */
    getPropertyDeclaration(propertyDeclaration: ts.PropertyDeclaration): compiler.PropertyDeclaration {
        return this.nodeCache.getOrCreate<compiler.PropertyDeclaration>(propertyDeclaration, () => new compiler.PropertyDeclaration(this, propertyDeclaration));
    }

    /**
     * Gets a wrapped property signature from a compiler object.
     * @param propertySignature - Property signature compiler object.
     */
    getPropertySignature(propertySignature: ts.PropertySignature): compiler.PropertySignature {
        return this.nodeCache.getOrCreate<compiler.PropertySignature>(propertySignature, () => new compiler.PropertySignature(this, propertySignature));
    }

    /**
     * Gets a wrapped set accessor declaration from a compiler object.
     * @param propertySignature - Get accessor declaration compiler object.
     */
    getSetAccessorDeclaration(setAccessor: ts.SetAccessorDeclaration): compiler.SetAccessorDeclaration {
        return this.nodeCache.getOrCreate<compiler.SetAccessorDeclaration>(setAccessor, () => new compiler.SetAccessorDeclaration(this, setAccessor));
    }

    /**
     * Gets a wrapped type alias declaration from a compiler object.
     * @param typeAliasDeclaration - TypeAlias declaration compiler object.
     */
    getTypeAliasDeclaration(typeAliasDeclaration: ts.TypeAliasDeclaration): compiler.TypeAliasDeclaration {
        return this.nodeCache.getOrCreate<compiler.TypeAliasDeclaration>(typeAliasDeclaration, () => new compiler.TypeAliasDeclaration(this, typeAliasDeclaration));
    }

    /**
     * Gets a wrapped variable declaration list from a compiler object.
     * @param declarationList - Compiler variable declaration list.
     */
    getVariableDeclarationList(declarationList: ts.VariableDeclarationList): compiler.VariableDeclarationList {
        return this.nodeCache.getOrCreate<compiler.VariableDeclarationList>(declarationList, () => new compiler.VariableDeclarationList(this, declarationList));
    }

    /**
     * Gets a wrapped variable statement from a compiler object.
     * @param variableStatement - Compiler variable statement.
     */
    getVariableStatement(statement: ts.VariableStatement): compiler.VariableStatement {
        return this.nodeCache.getOrCreate<compiler.VariableStatement>(statement, () => new compiler.VariableStatement(this, statement));
    }

    /**
     * Gets a wrapped variable declaration from a compiler object.
     * @param declaration - Compiler variable declaration.
     */
    getVariableDeclaration(declaration: ts.VariableDeclaration): compiler.VariableDeclaration {
        return this.nodeCache.getOrCreate<compiler.VariableDeclaration>(declaration, () => new compiler.VariableDeclaration(this, declaration));
    }

    /**
     * Gets a wrapped JS doc declaration from a compiler object.
     * @param declaration - Compiler JS doc declaration.
     */
    getJSDoc(declaration: ts.JSDoc): compiler.JSDoc {
        return this.nodeCache.getOrCreate<compiler.JSDoc>(declaration, () => new compiler.JSDoc(this, declaration));
    }

    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     */
    getSourceFile(compilerSourceFile: ts.SourceFile): compiler.SourceFile {
        // don't use the cache for temporary source files
        if (compilerSourceFile.fileName === this.fileNameUsedForTempSourceFile)
            return new compiler.SourceFile(this, compilerSourceFile);

        return this.nodeCache.getOrCreate<compiler.SourceFile>(compilerSourceFile, () => {
            const sourceFile = new compiler.SourceFile(this, compilerSourceFile);
            this.sourceFileCacheByFilePath.set(sourceFile.getFilePath(), sourceFile);
            this.languageService.addSourceFile(sourceFile);

            // add to list of directories
            const normalizedDir = FileUtils.getStandardizedAbsolutePath(FileUtils.getDirName(sourceFile.getFilePath()));
            if (!this.normalizedDirectories.has(normalizedDir))
                this.normalizedDirectories.add(normalizedDir);

            return sourceFile;
        });
    }

    /**
     * Gets a wrapped identifier from a compiler identifier.
     * @param identifier - Compiler identifier.
     */
    getIdentifier(identifier: ts.Identifier): compiler.Identifier {
        return this.nodeCache.getOrCreate<compiler.Identifier>(identifier, () => new compiler.Identifier(this, identifier));
    }

    /**
     * Gets a wrapped expression from a compiler expression.
     * @param expression - Compiler expression.
     */
    getExpression(expression: ts.Expression): compiler.Expression {
        return this.nodeCache.getOrCreate<compiler.Expression>(expression, () => new compiler.Expression(this, expression));
    }

    /**
     * Gets a wrapped type node from a compiler type node.
     * @param typeNode - Compiler type node.
     */
    getTypeNode(typeNode: ts.TypeNode): compiler.TypeNode {
        return this.nodeCache.getOrCreate<compiler.TypeNode>(typeNode, () => new compiler.TypeNode(this, typeNode));
    }

    /**
     * Gets a wrapped type parameter declaration from a compiler type parameter declaration.
     * @param typeParameterDeclaration - Compiler type parameter declaration.
     */
    getTypeParameterDeclaration(typeParameterDeclaration: ts.TypeParameterDeclaration): compiler.TypeParameterDeclaration {
        return this.nodeCache.getOrCreate<compiler.TypeParameterDeclaration>(typeParameterDeclaration, () => new compiler.TypeParameterDeclaration(this, typeParameterDeclaration));
    }

    /**
     * Gets a wrapped type from a compiler type.
     * @param type - Compiler type.
     */
    getType(type: ts.Type): compiler.Type {
        return new compiler.Type(this, type);
    }

    /**
     * Gets a wrapped signature from a compiler signature.
     * @param signature - Compiler signature.
     */
    getSignature(signature: ts.Signature): compiler.Signature {
        return new compiler.Signature(this, signature);
    }

    /**
     * Gets a wrapped symbol from a compiler symbol.
     * @param symbol - Compiler symbol.
     */
    getSymbol(symbol: ts.Symbol): compiler.Symbol {
        return new compiler.Symbol(this, symbol);
    }

    /**
     * Gets a wrapped diagnostic from a compiler diagnostic.
     * @param diagnostic - Compiler diagnostic.
     */
    getDiagnostic(diagnostic: ts.Diagnostic): compiler.Diagnostic {
        return new compiler.Diagnostic(this, diagnostic);
    }

    /**
     * Gets a wrapped diagnostic message chain from a compiler diagnostic message chain.
     * @param diagnostic - Compiler diagnostic message chain.
     */
    getDiagnosticMessageChain(diagnosticMessageChain: ts.DiagnosticMessageChain): compiler.DiagnosticMessageChain {
        return new compiler.DiagnosticMessageChain(this, diagnosticMessageChain);
    }

    /**
     * Replaces a compiler node in the cache.
     * @param oldNode - Old node to remove.
     * @param newNode - New node to use.
     */
    replaceCompilerNode(oldNode: ts.Node | compiler.Node, newNode: ts.Node) {
        const nodeToReplace = oldNode instanceof compiler.Node ? oldNode.getCompilerNode() : oldNode;
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
        this.nodeCache.removeByKey(node.getCompilerNode());
    }
}
