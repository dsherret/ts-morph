import * as ts from "typescript";

export class TsLanguageService {
    private readonly languageService: ts.LanguageService;
    private readonly sourceFiles: ts.SourceFile[] = [];

    constructor(private readonly compilerOptions: ts.CompilerOptions) {
        const host: ts.LanguageServiceHost = {
            getCompilationSettings: () => compilerOptions,
            getNewLine: () => "\n",
            getScriptFileNames: () => [] as string[],
            getScriptVersion: fileName => "",
            getScriptSnapshot: fileName => undefined as ts.IScriptSnapshot | undefined,
            getCurrentDirectory: () => "",
            getDefaultLibFileName: options => ts.getDefaultLibFileName(compilerOptions),
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => this.getSourceFileFromPath(path)!.text,
            fileExists: path => this.getSourceFileFromPath(path) != null
        };

        this.languageService = ts.createLanguageService(host);
    }

    getCompilerLanguageService() {
        return this.languageService;
    }

    addSourceFileFromText(filePath: string, sourceText: string) {
        this.sourceFiles.push(ts.createSourceFile(filePath, sourceText, this.getScriptTarget()));
    }

    getSourceFiles() {
        return this.sourceFiles;
    }

    private getSourceFileFromPath(path: string) {
        return this.sourceFiles.filter(f => f.fileName === path)[0] as ts.SourceFile | undefined;
    }

    private getScriptTarget() {
        return this.compilerOptions.target!;
    }
}
