import * as ts from "typescript";
import * as compiler from "./compiler";
import * as factories from "./factories";

export interface Options {
    compilerOptions?: ts.CompilerOptions;
    compilerHost?: ts.CompilerHost;
}

export class TsSimpleAst {
    private readonly compilerOptions: ts.CompilerOptions;
    private readonly languageService: compiler.LanguageService;
    private readonly compilerFactory: factories.CompilerFactory;

    constructor(options: Options = {}) {
        this.compilerOptions = options.compilerOptions || {};
        this.compilerOptions.target = this.compilerOptions.target || ts.ScriptTarget.Latest;
        this.languageService = new compiler.LanguageService(this.compilerOptions);
        this.compilerFactory = new factories.CompilerFactory(this.languageService);
    }

    createSourceFileFromText(filePath: string, sourceText: string): compiler.SourceFile {
        return this.compilerFactory.createSourceFileFromText(filePath, sourceText);
    }

    getSourceFiles(): compiler.SourceFile[] {
        return this.languageService.getSourceFiles();
    }
}
