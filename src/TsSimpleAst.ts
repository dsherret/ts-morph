import * as ts from "typescript";
import * as path from "path";
import {TsLanguageService} from "./compiler";

export interface Options {
    compilerOptions?: ts.CompilerOptions;
    compilerHost?: ts.CompilerHost;
}

export class TsSimpleAst {
    private readonly compilerOptions: ts.CompilerOptions;
    private readonly languageService: TsLanguageService;

    constructor(options: Options = {}) {
        this.compilerOptions = options.compilerOptions || {};
        this.compilerOptions.target = this.compilerOptions.target || ts.ScriptTarget.Latest;
        this.languageService = new TsLanguageService(this.compilerOptions);
    }

    addSourceFileFromText(filePath: string, sourceText: string) {
        this.languageService.addSourceFileFromText(filePath, sourceText);
    }

    getSourceFiles() {
        return this.languageService.getSourceFiles();
    }
}
