import * as ts from "typescript";
import * as fs from "fs";
import * as compiler from "./../compiler";
import * as structures from "./../structures";
import {KeyValueCache, Logger} from "./../utils";

/**
 * Factory for creating compiler wrappers.
 */
export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, compiler.TsSourceFile>();
    private readonly nodeCache = new KeyValueCache<ts.Node, compiler.TsNode<ts.Node>>();
    private readonly fileNameUsedForTempSourceFile = "tsSimpleAstTemporaryFile.ts";

    /**
     * Initializes a new instance of CompilerFactory.
     * @param languageService - Language service.
     */
    constructor(private readonly languageService: compiler.TsLanguageService) {
        languageService.setCompilerFactory(this);
    }

    /**
     * Convenience method to get the language service.
     */
    getLanguageService() {
        return this.languageService;
    }

    /**
     * Creates a source file from a file path and text.
     * Adds it to the cache.
     * @param filePath - File path for the source file.
     * @param sourceText - Text to create the source file with.
     */
    createSourceFileFromText(filePath: string, sourceText: string) {
        const sourceFile = ts.createSourceFile(filePath, sourceText, this.languageService.getScriptTarget(), true);
        const tsSourceFile = new compiler.TsSourceFile(this, sourceFile);
        this.nodeCache.set(sourceFile, tsSourceFile);
        this.sourceFileCacheByFilePath.set(filePath, tsSourceFile);
        this.languageService.addSourceFile(tsSourceFile);
        return tsSourceFile;
    }

    /**
     * Creates a temporary source file that won't be cached or added to the language service.
     * @param sourceText - Text to create the source file with.
     * @param filePath - File path to use.
     * @returns Wrapped source file.
     */
    createTempSourceFileFromText(sourceText: string, filePath = this.fileNameUsedForTempSourceFile) {
        const sourceFile = ts.createSourceFile(filePath, sourceText, this.getLanguageService().getScriptTarget(), true);
        return new compiler.TsSourceFile(this, sourceFile);
    }

    /**
     * Gets a source file from a file path. Will use the file path cache if the file exists.
     * @param filePath - File path to get the file from.
     * @returns Wrapped source file.
     */
    getSourceFileFromFilePath(filePath: string) {
        let sourceFile = this.sourceFileCacheByFilePath.get(filePath);
        if (sourceFile == null) {
            Logger.log(`Loading file: ${filePath}`);
            sourceFile = this.createSourceFileFromText(filePath, fs.readFileSync(filePath, "utf-8"));

            if (sourceFile != null)
                sourceFile.getReferencedFiles(); // fill referenced files
        }

        return sourceFile;
    }

    /**
     * Gets a wrapped compiler type based on the node's kind.
     * For example, an enum declaration will be returned a wrapped enum declaration.
     * @param node - Node to get the wrapped object from.
     * @returns Wrapped source file.
     */
    getTsNodeFromNode(node: ts.Node): compiler.TsNode<ts.Node> {
        if (node.kind === ts.SyntaxKind.EnumDeclaration)
            return this.getEnumDeclaration(node as ts.EnumDeclaration);
        if (node.kind === ts.SyntaxKind.EnumMember)
            return this.getEnumMemberDeclaration(node as ts.EnumMember);
        if (node.kind === ts.SyntaxKind.Identifier)
            return this.getIdentifier(node as ts.Identifier);
        if (node.kind === ts.SyntaxKind.SourceFile)
            return this.getSourceFile(node as ts.SourceFile);

        return this.nodeCache.getOrCreate<compiler.TsNode<ts.Node>>(node, () => new compiler.TsNode(this, node));
    }

    /**
     * Gets a wrapped enum declaration from a compiler object.
     * @param enumDeclaration - Enum declaration compiler object.
     * @returns Wrapped enum declaration.
     */
    getEnumDeclaration(enumDeclaration: ts.EnumDeclaration): compiler.TsEnumDeclaration {
        return this.nodeCache.getOrCreate<compiler.TsEnumDeclaration>(enumDeclaration, () => new compiler.TsEnumDeclaration(this, enumDeclaration));
    }

    /**
     * Gets a wrapped enum member declaration from a compiler object.
     * @param enumMemberDeclaration - Enum member declaration compiler object.
     * @returns Wrapped enum member declaration.
     */
    getEnumMemberDeclaration(enumMemberDeclaration: ts.EnumMember): compiler.TsEnumMemberDeclaration {
        return this.nodeCache.getOrCreate<compiler.TsEnumMemberDeclaration>(enumMemberDeclaration, () => new compiler.TsEnumMemberDeclaration(this, enumMemberDeclaration));
    }

    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     * @returns Wrapped source file.
     */
    getSourceFile(sourceFile: ts.SourceFile): compiler.TsSourceFile {
        // don't use the cache for temporary source files
        if (sourceFile.fileName === this.fileNameUsedForTempSourceFile)
            return new compiler.TsSourceFile(this, sourceFile);

        return this.nodeCache.getOrCreate<compiler.TsSourceFile>(sourceFile, () => {
            const tsSourceFile = new compiler.TsSourceFile(this, sourceFile);
            this.sourceFileCacheByFilePath.set(tsSourceFile.getFileName(), tsSourceFile);
            return tsSourceFile;
        });
    }

    /**
     * Gets a wrapped identifier from a compiler identifier.
     * @param identifier - Compiler identifier.
     * @returns Wrapped identifier.
     */
    getIdentifier(identifier: ts.Identifier): compiler.TsIdentifier {
        return this.nodeCache.getOrCreate<compiler.TsIdentifier>(identifier, () => new compiler.TsIdentifier(this, identifier));
    }

    replaceCompilerNode(oldNode: ts.Node | compiler.TsNode<ts.Node>, newNode: ts.Node) {
        const nodeToReplace = oldNode instanceof compiler.TsNode ? oldNode.getCompilerNode() : oldNode;
        const tsNode = oldNode instanceof compiler.TsNode ? oldNode : this.nodeCache.get(oldNode);

        this.nodeCache.replaceKey(nodeToReplace, newNode);

        if (tsNode != null)
            tsNode.replaceCompilerNode(newNode);
    }

    private addTsNodeToNodeCache(tsNode: compiler.TsNode<ts.Node>) {
        this.nodeCache.set(tsNode.getCompilerNode(), tsNode);
    }
}
