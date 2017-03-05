import * as ts from "typescript";
import * as fs from "fs";
import * as compiler from "./../compiler";
import {KeyValueCache, Logger} from "./../utils";

export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, compiler.TsSourceFile>();
    private readonly nodeCache = new KeyValueCache<ts.Node, compiler.TsNode<ts.Node>>();

    constructor(private readonly languageService: compiler.TsLanguageService) {
        languageService.setCompilerFactory(this);
    }

    getLanguageService() {
        return this.languageService;
    }

    createSourceFileFromText(filePath: string, sourceText: string) {
        const sourceFile = ts.createSourceFile(filePath, sourceText, this.languageService.getScriptTarget());
        const tsSourceFile = new compiler.TsSourceFile(this, sourceFile);
        this.nodeCache.set(sourceFile, tsSourceFile);
        this.sourceFileCacheByFilePath.set(filePath, tsSourceFile);
        this.languageService.addSourceFile(tsSourceFile);
        return tsSourceFile;
    }

    getSourceFileFromFilePath(filePath: string) {
        let sourceFile = this.sourceFileCacheByFilePath.get(filePath);
        if (sourceFile == null) {
            Logger.log(`Loading file: ${filePath}`);
            sourceFile = this.createSourceFileFromText(filePath, fs.readFileSync(filePath, "utf-8"));

            if (sourceFile != null)
                sourceFile.getReferencedFiles(); // fill
        }

        return sourceFile;
    }

    getTsNodeFromNode(node: ts.Node, parent: compiler.TsNode<ts.Node>) {
        if (node.kind === ts.SyntaxKind.EnumDeclaration)
            return this.getEnumDeclaration(node as ts.EnumDeclaration, parent);
        if (node.kind === ts.SyntaxKind.Identifier)
            return this.getIdentifier(node as ts.Identifier, parent);

        return this.nodeCache.getOrCreate(node, () => new compiler.TsNode(this, node, parent));
    }

    getEnumDeclaration(enumDeclaration: ts.EnumDeclaration, parent: compiler.TsNode<ts.Node>) {
        return this.nodeCache.getOrCreate(enumDeclaration, () => new compiler.TsEnumDeclaration(this, enumDeclaration, parent));
    }

    getSourceFile(sourceFile: ts.SourceFile) {
        return this.nodeCache.getOrCreate(sourceFile, () => {
            const tsSourceFile = new compiler.TsSourceFile(this, sourceFile);
            this.sourceFileCacheByFilePath.set(tsSourceFile.getFileName(), tsSourceFile);
            return tsSourceFile;
        });
    }

    getIdentifier(identifier: ts.Identifier, parent: compiler.TsNode<ts.Node>) {
        return this.nodeCache.getOrCreate(identifier, () => new compiler.TsIdentifier(this, identifier, parent));
    }

    replaceIdentifier(wrapper: compiler.TsIdentifier, newIdentifier: ts.Identifier) {
        this.nodeCache.replaceKey(wrapper.getCompilerNode(), newIdentifier);
        wrapper.replaceCompilerNode(newIdentifier);
    }
}
