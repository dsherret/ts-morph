import * as ts from "typescript";
import * as errors from "./errors";
import * as compiler from "./compiler";
import * as factories from "./factories";
import {CompilerOptionsResolver} from "./utils";
import {FileSystemHost} from "./FileSystemHost";
import {DefaultFileSystemHost} from "./DefaultFileSystemHost";

export interface Options {
    tsConfigFilePath?: string;
    compilerOptions?: ts.CompilerOptions;
    compilerHost?: ts.CompilerHost;
}

export class TsSimpleAst {
    private readonly compilerOptions: ts.CompilerOptions;
    private readonly languageService: compiler.LanguageService;
    private readonly compilerFactory: factories.CompilerFactory;

    constructor(options: Options = {}, private host: FileSystemHost = new DefaultFileSystemHost()) {
        if (options.tsConfigFilePath != null && options.compilerOptions != null)
            throw new errors.InvalidOperationError(`Cannot set both ${nameof(options.tsConfigFilePath)} and ${nameof(options.compilerOptions)}.`);

        const compilerOptionsResolver = new CompilerOptionsResolver(host);
        this.compilerOptions = compilerOptionsResolver.getCompilerOptions(options);

        this.languageService = new compiler.LanguageService(host, this.compilerOptions);
        this.compilerFactory = new factories.CompilerFactory(host, this.languageService);
    }

    getOrCreateSourceFileFromFilePath(filePath: string): compiler.SourceFile {
        return this.compilerFactory.getSourceFileFromFilePath(filePath);
    }

    createSourceFileFromText(filePath: string, sourceText: string): compiler.SourceFile {
        if (this.compilerFactory.containsSourceFileAtPath(filePath))
            throw new errors.InvalidOperationError(`A source file already exists at the provided file path: ${filePath}`);
        return this.compilerFactory.createSourceFileFromText(filePath, sourceText);
    }

    getSourceFiles(): compiler.SourceFile[] {
        return this.languageService.getSourceFiles();
    }
}
