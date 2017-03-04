import * as ts from "typescript";
import * as compiler from "./../compiler";
import {KeyValueCache} from "./../utils";

export class CompilerFactory {
    private readonly sourceFileCache = new KeyValueCache<ts.SourceFile, compiler.TsSourceFile>();
    private readonly identifierCache = new KeyValueCache<ts.Identifier, compiler.TsIdentifier>();

    constructor(private readonly languageService: compiler.TsLanguageService) {
    }

    getLanguageService() {
        return this.languageService;
    }

    createSourceFileFromText(filePath: string, sourceText: string) {
        const sourceFile = ts.createSourceFile(filePath, sourceText, this.languageService.getScriptTarget());
        const tsSourceFile = new compiler.TsSourceFile(this, sourceFile);
        this.sourceFileCache.add(sourceFile, tsSourceFile);
        this.languageService.addSourceFile(tsSourceFile);
        return tsSourceFile;
    }

    getSourceFile(sourceFile: ts.SourceFile) {
        return this.sourceFileCache.getOrCreate(sourceFile, () => new compiler.TsSourceFile(this, sourceFile));
    }

    getIdentifier(identifier: ts.Identifier, parent: compiler.TsNode<ts.Node>) {
        return this.identifierCache.getOrCreate(identifier, () => new compiler.TsIdentifier(this, identifier, parent));
    }

    replaceIdentifier(wrapper: compiler.TsIdentifier, newIdentifier: ts.Identifier) {
        this.identifierCache.replaceKey(wrapper.getCompilerNode(), newIdentifier);
        wrapper.replaceCompilerNode(newIdentifier);
    }
}
