import * as errors from "../../errors";
import { DefaultFileSystemHost } from "../../fileSystem";
import { ProjectContext } from "../../ProjectContext";
import { getTextFromFormattingEdits, replaceSourceFileTextForRename } from "../../manipulation";
import { CompilerOptions, EditorSettings, ScriptTarget, ts } from "../../typescript";
import { ArrayUtils, FileUtils, fillDefaultEditorSettings, fillDefaultFormatCodeSettings, KeyValueCache, ObjectUtils, StringUtils } from "../../utils";
import { Node } from "../common";
import { SourceFile } from "../file";
import { FormatCodeSettings, UserPreferences } from "./inputs";
import { Program } from "./Program";
import { DefinitionInfo, EmitOutput, FileTextChanges, ImplementationLocation, RenameLocation, TextChange } from "./results";
import { DocumentRegistry } from "../../factories/DocumentRegistry";

export class LanguageService {
    private readonly _compilerObject: ts.LanguageService;
    private readonly compilerHost: ts.CompilerHost;
    private program: Program;
    /** @internal */
    private context: ProjectContext;

    /**
     * Gets the compiler language service.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /** @internal */
    constructor(context: ProjectContext) {
        this.context = context;

        // I don't know what I'm doing for some of this...
        let version = 0;
        const fileExistsSync = (path: string) => this.context.compilerFactory.containsSourceFileAtPath(path) || context.fileSystemWrapper.fileExistsSync(path);
        const languageServiceHost: ts.LanguageServiceHost = {
            getCompilationSettings: () => context.compilerOptions.get(),
            getNewLine: () => context.manipulationSettings.getNewLineKindAsString(),
            getScriptFileNames: () => this.context.compilerFactory.getSourceFilePaths(),
            getScriptVersion: fileName => {
                const sourceFile = this.context.compilerFactory.getSourceFileFromCacheFromFilePath(fileName);
                if (sourceFile == null)
                    return (version++).toString();
                return this.context.compilerFactory.documentRegistry.getSourceFileVersion(sourceFile.compilerNode);
            },
            getScriptSnapshot: fileName => {
                if (!fileExistsSync(fileName))
                    return undefined;
                return ts.ScriptSnapshot.fromString(this.context.compilerFactory.addOrGetSourceFileFromFilePath(fileName)!.getFullText());
            },
            getCurrentDirectory: () => context.fileSystemWrapper.getCurrentDirectory(),
            getDefaultLibFileName: options => {
                if (this.context.fileSystemWrapper.getFileSystem() instanceof DefaultFileSystemHost)
                    return ts.getDefaultLibFilePath(context.compilerOptions.get());
                else
                    return FileUtils.pathJoin(context.fileSystemWrapper.getCurrentDirectory(), "node_modules/typescript/lib/" + ts.getDefaultLibFileName(context.compilerOptions.get()));
            },
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => {
                if (this.context.compilerFactory.containsSourceFileAtPath(path))
                    return this.context.compilerFactory.getSourceFileFromCacheFromFilePath(path)!.getFullText();
                return this.context.fileSystemWrapper.readFileSync(path, encoding);
            },
            fileExists: fileExistsSync,
            directoryExists: dirName => this.context.compilerFactory.containsDirectoryAtPath(dirName) || this.context.fileSystemWrapper.directoryExistsSync(dirName)
        };

        this.compilerHost = {
            getSourceFile: (fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) => {
                const sourceFile = this.context.compilerFactory.addOrGetSourceFileFromFilePath(fileName);
                return sourceFile == null ? undefined : sourceFile.compilerNode;
            },
            // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
            // getDefaultLibLocation: (...) => {},
            getDefaultLibFileName: (options: CompilerOptions) => languageServiceHost.getDefaultLibFileName(options),
            writeFile: (filePath, data, writeByteOrderMark, onError, sourceFiles) => {
                this.context.fileSystemWrapper.writeFileSync(filePath, data);
            },
            getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
            getDirectories: (path: string) => {
                // todo: not sure where this is used...
                return [];
            },
            fileExists: (fileName: string) => languageServiceHost.fileExists!(fileName),
            readFile: (fileName: string) => languageServiceHost.readFile!(fileName),
            getCanonicalFileName: (fileName: string) => this.context.fileSystemWrapper.getStandardizedAbsolutePath(fileName),
            useCaseSensitiveFileNames: () => languageServiceHost.useCaseSensitiveFileNames!(),
            getNewLine: () => languageServiceHost.getNewLine!(),
            getEnvironmentVariable: (name: string) => process.env[name]
        };

        this._compilerObject = ts.createLanguageService(languageServiceHost, this.context.compilerFactory.documentRegistry);
        this.program = new Program(this.context, this.context.compilerFactory.getSourceFilePaths(), this.compilerHost);

        this.context.compilerFactory.onSourceFileAdded(() => this.resetProgram());
        this.context.compilerFactory.onSourceFileRemoved(() => this.resetProgram());
    }

    /**
     * Resets the program. This should be done whenever any modifications happen.
     * @internal
     */
    resetProgram() {
        this.program.reset(this.context.compilerFactory.getSourceFilePaths(), this.compilerHost);
    }

    /**
     * Gets the language service's program.
     */
    getProgram() {
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
            replaceSourceFileTextForRename({
                sourceFile,
                renameLocations: locations,
                newName
            });
        }
    }

    /**
     * Gets the definitions for the specified node.
     * @param node - Node.
     */
    getDefinitions(node: Node): DefinitionInfo[] {
        return this.getDefinitionsAtPosition(node.sourceFile, node.getStart());
    }

    /**
     * Gets the definitions at the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position.
     */
    getDefinitionsAtPosition(sourceFile: SourceFile, pos: number): DefinitionInfo[] {
        const results = this.compilerObject.getDefinitionAtPosition(sourceFile.getFilePath(), pos) || [];
        return results.map(info => this.context.compilerFactory.getDefinitionInfo(info));
    }

    /**
     * Gets the implementations for the specified node.
     * @param node - Node.
     */
    getImplementations(node: Node): ImplementationLocation[] {
        return this.getImplementationsAtPosition(node.sourceFile, node.getStart());
    }

    /**
     * Gets the implementations at the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position.
     */
    getImplementationsAtPosition(sourceFile: SourceFile, pos: number): ImplementationLocation[] {
        const results = this.compilerObject.getImplementationAtPosition(sourceFile.getFilePath(), pos) || [];
        return results.map(location => new ImplementationLocation(this.context, location));
    }

    /**
     * Finds references based on the specified node.
     * @param node - Node to find references for.
     */
    findReferences(node: Node) {
        return this.findReferencesAtPosition(node.sourceFile, node.getStart());
    }

    /**
     * Finds the nodes that reference the definition(s) of the specified node.
     * @param node - Node.
     */
    findReferencesAsNodes(node: Node) {
        const references = this.findReferences(node);
        return ArrayUtils.from(getReferencingNodes());

        function* getReferencingNodes() {
            for (const referenceSymbol of references) {
                const isAlias = referenceSymbol.getDefinition().getKind() === ts.ScriptElementKind.alias;
                for (const reference of referenceSymbol.getReferences()) {
                    if (isAlias || !reference.isDefinition())
                        yield reference.getNode();
                }
            }
        }
    }

    /**
     * Finds references based on the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position to find the reference at.
     */
    findReferencesAtPosition(sourceFile: SourceFile, pos: number) {
        const results = this.compilerObject.findReferences(sourceFile.getFilePath(), pos) || [];
        return results.map(s => this.context.compilerFactory.getReferencedSymbol(s));
    }

    /**
     * Find the rename locations for the specified node.
     * @param node - Node to get the rename locations for.
     */
    findRenameLocations(node: Node): RenameLocation[] {
        const renameLocations = this.compilerObject.findRenameLocations(node.sourceFile.getFilePath(), node.getStart(), false, false) || [];
        return renameLocations.map(l => new RenameLocation(this.context, l));
    }

    /**
     * Gets the formatting edits for a range.
     * @param filePath - File path.
     * @param range - Position range.
     * @param settings - Settings.
     */
    getFormattingEditsForRange(filePath: string, range: [number, number], settings: FormatCodeSettings) {
        return (this.compilerObject.getFormattingEditsForRange(filePath, range[0], range[1], this._getFilledSettings(settings)) || []).map(e => new TextChange(e));
    }

    /**
     * Gets the formatting edits for a document.
     * @param filePath - File path of the source file.
     * @param settings - Format code settings.
     */
    getFormattingEditsForDocument(filePath: string, settings: FormatCodeSettings) {
        return (this.compilerObject.getFormattingEditsForDocument(filePath, this._getFilledSettings(settings)) || []).map(e => new TextChange(e));
    }

    /**
     * Gets the formatted text for a document.
     * @param filePath - File path of the source file.
     * @param settings - Format code settings.
     */
    getFormattedDocumentText(filePath: string, settings: FormatCodeSettings) {
        const sourceFile = this.context.compilerFactory.getSourceFileFromCacheFromFilePath(filePath);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(filePath);

        settings = this._getFilledSettings(settings);
        const formattingEdits = this.getFormattingEditsForDocument(filePath, settings);
        let newText = getTextFromFormattingEdits(sourceFile, formattingEdits);
        const newLineChar = settings.newLineCharacter!;

        if (settings.ensureNewLineAtEndOfFile && !StringUtils.endsWith(newText, newLineChar))
            newText += newLineChar;

        return newText.replace(/\r?\n/g, newLineChar);
    }

    /**
     * Gets the emit output of a source file.
     * @param sourceFile - Source file.
     * @param emitOnlyDtsFiles - Whether to only emit the d.ts files.
     */
    getEmitOutput(sourceFile: SourceFile, emitOnlyDtsFiles?: boolean): EmitOutput;
    /**
     * Gets the emit output of a source file.
     * @param filePath - File path.
     * @param emitOnlyDtsFiles - Whether to only emit the d.ts files.
     */
    getEmitOutput(filePath: string, emitOnlyDtsFiles?: boolean): EmitOutput;
    /** @internal */
    getEmitOutput(filePathOrSourceFile: SourceFile | string, emitOnlyDtsFiles?: boolean): EmitOutput;
    getEmitOutput(filePathOrSourceFile: SourceFile | string, emitOnlyDtsFiles?: boolean): EmitOutput {
        const filePath = this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
        return new EmitOutput(this.context, filePath, this.compilerObject.getEmitOutput(filePath, emitOnlyDtsFiles));
    }

    /**
     * Gets the indentation at the specified position.
     * @param sourceFile - Source file.
     * @param position - Position.
     * @param settings - Editor settings.
     */
    getIdentationAtPosition(sourceFile: SourceFile, position: number, settings?: EditorSettings): number;
    /**
     * Gets the indentation at the specified position.
     * @param filePath - File path.
     * @param position - Position.
     * @param settings - Editor settings.
     */
    getIdentationAtPosition(filePath: string, position: number, settings?: EditorSettings): number;
    getIdentationAtPosition(filePathOrSourceFile: SourceFile | string, position: number, settings?: EditorSettings): number {
        const filePath = this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
        if (settings == null)
            settings = this.context.manipulationSettings.getEditorSettings();
        else
            fillDefaultEditorSettings(settings, this.context.manipulationSettings);
        return this.compilerObject.getIndentationAtPosition(filePath, position, settings);
    }

    /**
     * Gets the file text changes for organizing the imports in a source file.
     *
     * @param sourceFile - Source file.
     * @param settings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(sourceFile: SourceFile, settings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
    /**
     * Gets the file text changes for organizing the imports in a source file.
     *
     * @param filePath - File path of the source file.
     * @param settings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(filePath: string, settings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
    organizeImports(filePathOrSourceFile: string | SourceFile, settings: FormatCodeSettings = {}, userPreferences: UserPreferences = {}): FileTextChanges[] {
        const scope: ts.OrganizeImportsScope = {
            type: "file",
            fileName: this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile)
        };
        return this.compilerObject.organizeImports(scope, this._getFilledSettings(settings), this._getFilledUserPreferences(userPreferences))
            .map(fileTextChanges => new FileTextChanges(fileTextChanges));
    }

    private _getFilePathFromFilePathOrSourceFile(filePathOrSourceFile: SourceFile | string) {
        const filePath = typeof filePathOrSourceFile === "string"
            ? this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePathOrSourceFile)
            : filePathOrSourceFile.getFilePath();
        if (!this.context.compilerFactory.containsSourceFileAtPath(filePath))
            throw new errors.FileNotFoundError(filePath);
        return filePath;
    }

    private _getFilledSettings(settings: FormatCodeSettings) {
        if ((settings as any)["_filled"]) // optimization
            return settings;
        settings = ObjectUtils.assign(this.context.getFormatCodeSettings(), settings);
        fillDefaultFormatCodeSettings(settings, this.context.manipulationSettings);
        (settings as any)["_filled"] = true;
        return settings;
    }

    private _getFilledUserPreferences(userPreferences: UserPreferences) {
        return ObjectUtils.assign(this.context.getUserPreferences(), userPreferences);
    }
}
