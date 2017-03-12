import * as ts from "typescript";
import * as fs from "fs";
import * as compiler from "./../compiler";
import * as structures from "./../structures";
import {KeyValueCache, Logger} from "./../utils";

/**
 * Factory for creating compiler wrappers.
 */
export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, compiler.SourceFile>();
    private readonly nodeCache = new KeyValueCache<ts.Node, compiler.Node<ts.Node>>();
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
        const compilerSourceFile = ts.createSourceFile(filePath, sourceText, this.languageService.getScriptTarget(), true);
        const sourceFile = new compiler.SourceFile(this, compilerSourceFile);
        this.nodeCache.set(compilerSourceFile, sourceFile);
        this.sourceFileCacheByFilePath.set(filePath, sourceFile);
        this.languageService.addSourceFile(sourceFile);
        return sourceFile;
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
    getNodeFromCompilerNode(compilerNode: ts.Node): compiler.Node<ts.Node> {
        switch (compilerNode.kind) {
            case ts.SyntaxKind.EnumDeclaration:
                return this.getEnumDeclaration(compilerNode as ts.EnumDeclaration);
            case ts.SyntaxKind.EnumMember:
                return this.getEnumMemberDeclaration(compilerNode as ts.EnumMember);
            case ts.SyntaxKind.Identifier:
                return this.getIdentifier(compilerNode as ts.Identifier);
            case ts.SyntaxKind.SourceFile:
                return this.getSourceFile(compilerNode as ts.SourceFile);
            default:
                return this.nodeCache.getOrCreate<compiler.Node<ts.Node>>(compilerNode, () => new compiler.Node(this, compilerNode));
        }
    }

    /**
     * Gets a wrapped enum declaration from a compiler object.
     * @param enumDeclaration - Enum declaration compiler object.
     * @returns Wrapped enum declaration.
     */
    getEnumDeclaration(enumDeclaration: ts.EnumDeclaration): compiler.EnumDeclaration {
        return this.nodeCache.getOrCreate<compiler.EnumDeclaration>(enumDeclaration, () => new compiler.EnumDeclaration(this, enumDeclaration));
    }

    /**
     * Gets a wrapped enum member declaration from a compiler object.
     * @param enumMemberDeclaration - Enum member declaration compiler object.
     * @returns Wrapped enum member declaration.
     */
    getEnumMemberDeclaration(enumMemberDeclaration: ts.EnumMember): compiler.EnumMemberDeclaration {
        return this.nodeCache.getOrCreate<compiler.EnumMemberDeclaration>(enumMemberDeclaration, () => new compiler.EnumMemberDeclaration(this, enumMemberDeclaration));
    }

    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     * @returns Wrapped source file.
     */
    getSourceFile(compilerSourceFile: ts.SourceFile): compiler.SourceFile {
        // don't use the cache for temporary source files
        if (compilerSourceFile.fileName === this.fileNameUsedForTempSourceFile)
            return new compiler.SourceFile(this, compilerSourceFile);

        return this.nodeCache.getOrCreate<compiler.SourceFile>(compilerSourceFile, () => {
            const sourceFile = new compiler.SourceFile(this, compilerSourceFile);
            this.sourceFileCacheByFilePath.set(sourceFile.getFileName(), sourceFile);
            return sourceFile;
        });
    }

    /**
     * Gets a wrapped identifier from a compiler identifier.
     * @param identifier - Compiler identifier.
     * @returns Wrapped identifier.
     */
    getIdentifier(identifier: ts.Identifier): compiler.Identifier {
        return this.nodeCache.getOrCreate<compiler.Identifier>(identifier, () => new compiler.Identifier(this, identifier));
    }

    replaceCompilerNode(oldNode: ts.Node | compiler.Node<ts.Node>, newNode: ts.Node) {
        const nodeToReplace = oldNode instanceof compiler.Node ? oldNode.getCompilerNode() : oldNode;
        const node = oldNode instanceof compiler.Node ? oldNode : this.nodeCache.get(oldNode);

        this.nodeCache.replaceKey(nodeToReplace, newNode);

        if (node != null)
            node.replaceCompilerNode(newNode);
    }
}
