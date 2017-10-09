import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";
import {replaceNodeText} from "./../../manipulation";
import * as errors from "./../../errors";
import {KeyValueCache, FileUtils} from "./../../utils";
import {SourceFile} from "./../file";
import {Node} from "./../common";
import {Program} from "./Program";
import {ReferencedSymbol, DefinitionInfo, RenameLocation} from "./results";

export class LanguageService {
    private readonly _compilerObject: ts.LanguageService;
    private readonly sourceFiles: SourceFile[] = [];
    private readonly compilerHost: ts.CompilerHost;
    private program: Program;
    /** @internal */
    private global: GlobalContainer;

    /**
     * Gets the compiler language service.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /** @internal */
    constructor(global: GlobalContainer) {
        this.global = global;

        // I don't know what I'm doing for some of this...
        let version = 0;
        const fileExistsSync = (path: string) => this.global.compilerFactory.containsSourceFileAtPath(path) || global.fileSystem.fileExistsSync(path);
        const languageServiceHost: ts.LanguageServiceHost = {
            getCompilationSettings: () => global.compilerOptions,
            getNewLine: () => global.manipulationSettings.getNewLineKind(),
            getScriptFileNames: () => this.sourceFiles.map(s => s.getFilePath()),
            getScriptVersion: fileName => {
                return (version++).toString();
            },
            getScriptSnapshot: fileName => {
                if (!fileExistsSync(fileName))
                    return undefined;
                return ts.ScriptSnapshot.fromString(this.global.compilerFactory.getSourceFileFromFilePath(fileName)!.getFullText());
            },
            getCurrentDirectory: () => global.fileSystem.getCurrentDirectory(),
            getDefaultLibFileName: options => ts.getDefaultLibFilePath(global.compilerOptions),
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => {
                if (this.global.compilerFactory.containsSourceFileAtPath(path))
                    return this.global.compilerFactory.getSourceFileFromFilePath(path)!.getFullText();
                return this.global.fileSystem.readFile(path, encoding);
            },
            fileExists: fileExistsSync,
            directoryExists: dirName => this.global.compilerFactory.containsFileInDirectory(dirName) || this.global.fileSystem.directoryExistsSync(dirName)
        };

        this.compilerHost = {
            getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
                return this.global.compilerFactory.getSourceFileFromFilePath(fileName)!.compilerNode;
            },
            // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
            // getDefaultLibLocation: (...) => {},
            getDefaultLibFileName: (options: ts.CompilerOptions) => languageServiceHost.getDefaultLibFileName(options),
            writeFile: (filePath, data, writeByteOrderMark, onError, sourceFiles) => {
                FileUtils.ensureDirectoryExistsSync(this.global.fileSystem, FileUtils.getDirName(filePath));
                this.global.fileSystem.writeFileSync(filePath, data);
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

        this._compilerObject = ts.createLanguageService(languageServiceHost);
    }

    /**
     * Resets the program. This should be done whenever any modifications happen.
     * @internal
     */
    resetProgram() {
        if (this.program != null)
            this.program.reset(this.getSourceFiles().map(s => s.getFilePath()), this.compilerHost);
    }

    /**
     * Gets the language service's program.
     */
    getProgram() {
        if (this.program == null)
            this.program = new Program(this.global, this.getSourceFiles().map(s => s.getFilePath()), this.compilerHost);
        return this.program;
    }

    /**
     * Rename the specified node.
     * @param node - Node to rename.
     * @param newName - New name for the node.
     */
    renameNode(node: Node, newName: string) {
        errors.throwIfNotStringOrWhitespace(newName, nameof(newName));

        if (node.getText() === newName)
            return;
        this.renameLocations(this.findRenameLocations(node), newName);
    }

    /**
     * Rename the provided rename locations.
     * @param renameLocations - Rename locations.
     * @param newName - New name for the node.
     */
    renameLocations(renameLocations: RenameLocation[], newName: string) {
        const renameLocationsBySourceFile = new KeyValueCache<SourceFile, RenameLocation[]>();
        for (const renameLocation of renameLocations) {
            const locations = renameLocationsBySourceFile.getOrCreate<RenameLocation[]>(renameLocation.getSourceFile(), () => []);
            locations.push(renameLocation);
        }

        for (const [sourceFile, locations] of renameLocationsBySourceFile.getEntries()) {
            let difference = 0;
            for (const textSpan of locations.map(l => l.getTextSpan())) {
                let start = textSpan.getStart();
                start -= difference;
                replaceNodeText(sourceFile, start, start + textSpan.getLength(), newName);
                difference += textSpan.getLength() - newName.length;
            }
        }
    }

    /**
     * Gets the definitions for the specified node.
     * @param sourceFile - Source file.
     * @param node - Node.
     */
    getDefinitions(sourceFile: SourceFile, node: Node): DefinitionInfo[] {
        return this.getDefinitionsAtPosition(sourceFile, node.getStart());
    }

    /**
     * Gets the definitions at the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position.
     */
    getDefinitionsAtPosition(sourceFile: SourceFile, pos: number): DefinitionInfo[] {
        const results = this.compilerObject.getDefinitionAtPosition(sourceFile.getFilePath(), pos) || [];
        return results.map(info => new DefinitionInfo(this.global, info));
    }

    /**
     * Finds references based on the specified node.
     * @param sourceFile - Source file.
     * @param node - Node to find references for.
     */
    findReferences(sourceFile: SourceFile, node: Node) {
        return this.findReferencesAtPosition(sourceFile, node.getStart());
    }

    /**
     * Finds references based on the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position to find the reference at.
     */
    findReferencesAtPosition(sourceFile: SourceFile, pos: number) {
        const results = this.compilerObject.findReferences(sourceFile.getFilePath(), pos) || [];
        return results.map(s => new ReferencedSymbol(this.global, s));
    }

    /**
     * Find the rename locations for the specified node.
     * @param node - Node to get the rename locations for.
     */
    findRenameLocations(node: Node): RenameLocation[] {
        const sourceFile = node.getSourceFile();
        const renameLocations = this.compilerObject.findRenameLocations(sourceFile.getFilePath(), node.getStart(), false, false) || [];
        return renameLocations.map(l => new RenameLocation(this.global, l));
    }

    /**
     * @internal
     */
    addSourceFile(sourceFile: SourceFile) {
        // todo: these source files should be strictly stored in the factory cache
        this.sourceFiles.push(sourceFile);
        this.resetProgram();
    }

    /**
     * @internal
     */
    removeSourceFile(sourceFile: SourceFile) {
        const index = this.sourceFiles.indexOf(sourceFile);
        if (index === -1)
            return false;

        this.sourceFiles.splice(index, 1);
        this.resetProgram();
        sourceFile.dispose(); // todo: don't dispose, just remove the language service for this node
        return true;
    }

    /**
     * @internal
     */
    getSourceFiles() {
        return this.sourceFiles;
    }
}
