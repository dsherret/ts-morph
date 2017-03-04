import * as ts from "typescript";
import {TsSourceFile} from "./TsSourceFile";
import {TsNode} from "./TsNode";

export class TsLanguageService {
    private readonly languageService: ts.LanguageService;
    private readonly tsSourceFiles: TsSourceFile[] = [];

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

    findRenameLocations(node: TsNode<ts.Node>) {
        const sourceFile = node.getSourceFile();
        if (sourceFile == null)
            throw new Error("Node has no sourcefile");

        const renameLocations = this.languageService.findRenameLocations(sourceFile.getFileName(), sourceFile.getPosition(), false, false);
    }

    getCompilerLanguageService() {
        return this.languageService;
    }

    addSourceFile(tsSourceFile: TsSourceFile) {
        this.tsSourceFiles.push(tsSourceFile);
    }

    getScriptTarget() {
        return this.compilerOptions.target!;
    }

    getSourceFiles() {
        return this.tsSourceFiles;
    }

    private getSourceFileFromPath(path: string) {
        return this.tsSourceFiles.filter(f => f.fileName === path)[0] as ts.SourceFile | undefined;
    }
}
