import * as ts from "typescript";
import * as path from "path";
import {TsLanguageService} from "./compiler";
import {CompilerFactory, DefinitionFactory} from "./factories";

export interface Options {
    compilerOptions?: ts.CompilerOptions;
    compilerHost?: ts.CompilerHost;
}

export class TsSimpleAst {
    private readonly compilerOptions: ts.CompilerOptions;
    private readonly languageService: TsLanguageService;
    private readonly compilerFactory: CompilerFactory;
    private readonly definitionFactory: DefinitionFactory;

    constructor(options: Options = {}) {
        this.compilerOptions = options.compilerOptions || {};
        this.compilerOptions.target = this.compilerOptions.target || ts.ScriptTarget.Latest;
        this.languageService = new TsLanguageService(this.compilerOptions);
        this.compilerFactory = new CompilerFactory(this.languageService);
        this.definitionFactory = new DefinitionFactory();
    }

    createSourceFileFromText(filePath: string, sourceText: string) {
        const tsSourceFile = this.compilerFactory.createSourceFileFromText(filePath, sourceText);
        return this.definitionFactory.getSourceFile(tsSourceFile);
    }

    getSourceFiles() {
        return this.languageService.getSourceFiles().map(f => this.definitionFactory.getSourceFile(f));
    }
}
