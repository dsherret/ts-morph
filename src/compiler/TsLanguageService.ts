import * as ts from "typescript";
import * as fs from "fs";
import {TsSourceFile} from "./TsSourceFile";
import {TsNode} from "./TsNode";
import {CompilerFactory} from "./../factories";

export interface RenameLocation {
    tsSourceFile: TsSourceFile;
    textSpan: TextSpan;
}

export interface TextSpan {
    start: number;
    length: number;
}

export class TsLanguageService {
    private readonly languageService: ts.LanguageService;
    private readonly tsSourceFiles: TsSourceFile[] = [];
    private compilerFactory: CompilerFactory;

    constructor(private readonly compilerOptions: ts.CompilerOptions) {
        let version = 0;
        const host: ts.LanguageServiceHost = {
            getCompilationSettings: () => compilerOptions,
            getNewLine: () => "\n",
            getScriptFileNames: () => this.tsSourceFiles.map(s => s.getFileName()),
            getScriptVersion: fileName => {
                return (version++).toString();
            },
            getScriptSnapshot: fileName => {
                console.log(`Getting snapshot: ${fileName}`);
                console.log(this.compilerFactory.getSourceFileFromFilePath(fileName));
                const snapshot = ts.ScriptSnapshot.fromString(this.compilerFactory.getSourceFileFromFilePath(fileName)!.getText());
                console.log(snapshot);
                return snapshot;
            },
            getCurrentDirectory: () => "",
            getDefaultLibFileName: options => ts.getDefaultLibFilePath(compilerOptions),
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => {
                console.log("READING");
                return this.compilerFactory.getSourceFileFromFilePath(path)!.getText();
            },
            fileExists: path => {
                console.log("CHECKING FILE EXISTS");
                return this.compilerFactory.getSourceFileFromFilePath(path) != null;
            },
            directoryExists: dirName => {
                console.log(`Checking dir exists: ${dirName}`);
                return true;
            }
        };

        this.languageService = ts.createLanguageService(host);
    }

    // todo: mark internal
    setCompilerFactory(compilerFactory: CompilerFactory) {
        if (this.compilerFactory != null)
            throw new Error("Cannot set compiler factory more than once.");

        this.compilerFactory = compilerFactory;
    }

    findRenameLocations(node: TsNode<ts.Node>): RenameLocation[] {
        const sourceFile = node.getSourceFile();
        if (sourceFile == null)
            throw new Error("Node has no sourcefile");

        const renameLocations = this.languageService.findRenameLocations(sourceFile.getFileName(), sourceFile.getPosition(), false, false) || [];
        return renameLocations.map(l => ({
            tsSourceFile: this.compilerFactory.getSourceFileFromFilePath(l.fileName)!,
            textSpan: {
                start: l.textSpan.start,
                length: l.textSpan.length
            }
        }));
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
}
