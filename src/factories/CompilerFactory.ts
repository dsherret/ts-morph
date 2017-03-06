import * as ts from "typescript";
import * as fs from "fs";
import * as compiler from "./../compiler";
import * as structures from "./../structures";
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
        tsSourceFile.ensureChildrenParentSet();
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

    getTsNodeFromNode(node: ts.Node): compiler.TsNode<ts.Node> {
        if (node.kind === ts.SyntaxKind.EnumDeclaration)
            return this.getEnumDeclaration(node as ts.EnumDeclaration);
        if (node.kind === ts.SyntaxKind.Identifier)
            return this.getIdentifier(node as ts.Identifier);
        if (node.kind === ts.SyntaxKind.SourceFile)
            return this.getSourceFile(node as ts.SourceFile);

        return this.nodeCache.getOrCreate<compiler.TsNode<ts.Node>>(node, () => new compiler.TsNode(this, node));
    }

    getEnumDeclaration(enumDeclaration: ts.EnumDeclaration): compiler.TsEnumDeclaration {
        return this.nodeCache.getOrCreate<compiler.TsEnumDeclaration>(enumDeclaration, () => new compiler.TsEnumDeclaration(this, enumDeclaration));
    }

    createEnumDeclaration(structure: structures.EnumStructure) {
        const decorators = [] as any[]; // todo
        const modifiers = [] as any[]; // todo
        const members = [] as any[]; // todo
        const declaration = ts.createEnumDeclaration(decorators, modifiers, structure.name, members);
        const tsEnumDeclaration = new compiler.TsEnumDeclaration(this, declaration);
        this.nodeCache.set(declaration, tsEnumDeclaration);
        return tsEnumDeclaration;
    }

    getSourceFile(sourceFile: ts.SourceFile): compiler.TsSourceFile {
        return this.nodeCache.getOrCreate<compiler.TsSourceFile>(sourceFile, () => {
            const tsSourceFile = new compiler.TsSourceFile(this, sourceFile);
            this.sourceFileCacheByFilePath.set(tsSourceFile.getFileName(), tsSourceFile);
            return tsSourceFile;
        });
    }

    getIdentifier(identifier: ts.Identifier): compiler.TsIdentifier {
        return this.nodeCache.getOrCreate<compiler.TsIdentifier>(identifier, () => new compiler.TsIdentifier(this, identifier));
    }

    replaceIdentifier(wrapper: compiler.TsIdentifier, newIdentifier: ts.Identifier) {
        this.nodeCache.replaceKey(wrapper.getCompilerNode(), newIdentifier);
        wrapper.replaceCompilerNode(newIdentifier);
    }
}
