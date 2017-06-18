import * as ts from "typescript";
import {FileSystemHost} from "./../../FileSystemHost";
import {CompilerFactory} from "./../../factories";
import {replaceNodeText} from "./../../manipulation";
import {KeyValueCache, FileUtils} from "./../../utils";
import {SourceFile} from "./../file";
import {Node} from "./../common";
import {Program} from "./Program";

export interface SourceFileReplace {
    sourceFile: SourceFile;
    textSpans: TextSpan[];
}

export interface TextSpan {
    start: number;
    length: number;
}

export interface ReferenceEntry {
    textSpan: TextSpan;
    isWriteAccess: boolean;
    isDefinition: boolean;
    isInString: boolean;
}

export interface SourceFileReferenceEntry {
    sourceFile: SourceFile;
    references: ReferenceEntry[];
}

export class LanguageService {
    private readonly languageService: ts.LanguageService;
    private readonly sourceFiles: SourceFile[] = [];
    private readonly compilerHost: ts.CompilerHost;
    private compilerFactory: CompilerFactory;
    private program: Program;

    constructor(private readonly fileSystem: FileSystemHost, private readonly compilerOptions: ts.CompilerOptions) {
        // I don't know what I'm doing for some of this...
        let version = 0;
        const fileExists = (path: string) => this.compilerFactory.containsSourceFileAtPath(path) || fileSystem.fileExists(path);
        const languageServiceHost: ts.LanguageServiceHost = {
            getCompilationSettings: () => compilerOptions,
            getNewLine: () => this.getNewLine(),
            getScriptFileNames: () => this.sourceFiles.map(s => s.getFilePath()),
            getScriptVersion: fileName => {
                return (version++).toString();
            },
            getScriptSnapshot: fileName => {
                if (!fileExists(fileName))
                    return undefined;
                return ts.ScriptSnapshot.fromString(this.compilerFactory.getSourceFileFromFilePath(fileName)!.getFullText());
            },
            getCurrentDirectory: () => fileSystem.getCurrentDirectory(),
            getDefaultLibFileName: options => ts.getDefaultLibFilePath(compilerOptions),
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => {
                if (this.compilerFactory.containsSourceFileAtPath(path))
                    return this.compilerFactory.getSourceFileFromFilePath(path)!.getFullText();
                return this.fileSystem.readFile(path, encoding);
            },
            fileExists,
            directoryExists: dirName => this.compilerFactory.containsFileInDirectory(dirName) || this.fileSystem.directoryExists(dirName)
        };

        this.compilerHost = {
            getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
                return this.compilerFactory.getSourceFileFromFilePath(fileName).getCompilerNode();
            },
            // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
            // getDefaultLibLocation: (...) => {},
            getDefaultLibFileName: (options: ts.CompilerOptions) => languageServiceHost.getDefaultLibFileName(options),
            writeFile: () => {
                console.log("ATTEMPT TO WRITE FILE");
            },
            getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
            getDirectories: (path: string) => {
                console.log("ATTEMPT TO GET DIRECTORIES");
                return [];
            },
            fileExists: (fileName: string) => languageServiceHost.fileExists!(fileName),
            readFile: (fileName: string) => languageServiceHost.readFile!(fileName),
            getCanonicalFileName: (fileName: string) => FileUtils.getStandardizedAbsolutePath(fileName),
            useCaseSensitiveFileNames: () => languageServiceHost.useCaseSensitiveFileNames!(),
            getNewLine: () => languageServiceHost.getNewLine!(),
            getEnvironmentVariable: (name: string) => process.env[name]
        };

        this.languageService = ts.createLanguageService(languageServiceHost);
    }

    /** @internal */
    resetProgram() {
        if (this.program != null)
            this.program.reset(this.getSourceFiles().map(s => s.getFilePath()), this.compilerOptions, this.compilerHost);
    }

    getCompilerLanguageService() {
        return this.languageService;
    }

    /**
     * Gets the language service's program.
     */
    getProgram() {
        if (this.program == null)
            this.program = new Program(this.compilerFactory, this.getSourceFiles().map(s => s.getFilePath()), this.compilerOptions, this.compilerHost);
        return this.program;
    }

    /**
     * Sets the compiler factory. Needed because of a circular reference.
     * @internal
     * @param compilerFactory - Compiler factory.
     */
    setCompilerFactory(compilerFactory: CompilerFactory) {
        if (this.compilerFactory != null)
            throw new Error("Cannot set compiler factory more than once.");

        this.compilerFactory = compilerFactory;
    }

    renameNode(node: Node, newName: string) {
        if (node.getText() === newName)
            return;
        this.renameReplaces(this.findRenameReplaces(node), newName);
    }

    renameReplaces(replaces: SourceFileReplace[], newName: string) {
        for (const renameReplace of replaces) {
            let difference = 0;
            for (const textSpan of renameReplace.textSpans) {
                textSpan.start -= difference;
                replaceNodeText(renameReplace.sourceFile, textSpan.start, textSpan.start + textSpan.length, newName);
                difference += textSpan.length - newName.length;
            }
        }
    }

    findRenameReplaces(node: Node): SourceFileReplace[] {
        const sourceFile = node.getSourceFile();
        const textSpansBySourceFile = new KeyValueCache<SourceFile, TextSpan[]>();
        const renameLocations = this.languageService.findRenameLocations(sourceFile.getFilePath(), node.getStart(), false, false) || [];

        for (const location of renameLocations) {
            const replaceSourceFile = this.compilerFactory.getSourceFileFromFilePath(location.fileName)!;
            const textSpans = textSpansBySourceFile.getOrCreate<TextSpan[]>(replaceSourceFile, () => []);
            // todo: ensure this is sorted
            textSpans.push({
                start: location.textSpan.start,
                length: location.textSpan.length
            });
        }

        const replaces: SourceFileReplace[] = [];

        for (const entry of textSpansBySourceFile.getEntries()) {
            replaces.push({
                sourceFile: entry[0],
                textSpans: entry[1]
            });
        }

        return replaces;
    }

    /**
     * Gets the references at a specified node.
     * @param node - Node to get the references for.
     */
    getReferencesAtNode(node: Node) {
        const references = this.languageService.getReferencesAtPosition(node.getSourceFile().getFilePath(), node.getStart());
        const referencesBySourceFile = new KeyValueCache<SourceFile, ReferenceEntry[]>();

        for (const reference of references) {
            const referenceSourceFile = this.compilerFactory.getSourceFileFromFilePath(reference.fileName)!;
            const currentRefs = referencesBySourceFile.getOrCreate<ReferenceEntry[]>(referenceSourceFile, () => []);
            // todo: ensure this is sorted
            currentRefs.push({
                isDefinition: reference.isDefinition,
                isInString: reference.isInString || false,
                isWriteAccess: reference.isWriteAccess,
                textSpan: {
                    start: reference.textSpan.start,
                    length: reference.textSpan.length
                }
            });
        }

        const referenceEntries: SourceFileReferenceEntry[] = [];

        for (const entry of referencesBySourceFile.getEntries()) {
            referenceEntries.push({
                sourceFile: entry[0],
                references: entry[1]
            });
        }

        return referenceEntries;
    }

    addSourceFile(sourceFile: SourceFile) {
        this.sourceFiles.push(sourceFile);
        this.resetProgram();
    }

    getScriptTarget() {
        return this.compilerOptions.target!;
    }

    getNewLine() {
        switch (this.compilerOptions.newLine) {
            case undefined:
            case ts.NewLineKind.LineFeed:
                return "\n";
            case ts.NewLineKind.CarriageReturnLineFeed:
                return "\r\n";
            default:
                throw new Error("Not implemented new line kind.");
        }
    }

    getOneIndentationLevelText() {
        return "    ";
    }

    getSourceFiles() {
        return this.sourceFiles;
    }
}
