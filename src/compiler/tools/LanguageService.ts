import * as errors from "../../errors";
import { DefaultFileSystemHost } from "../../fileSystem";
import { ProjectContext } from "../../ProjectContext";
import { getTextFromFormattingEdits, replaceSourceFileTextForRename } from "../../manipulation";
import { CompilerOptions, EditorSettings, ScriptTarget, ts } from "../../typescript";
import { FileUtils, fillDefaultEditorSettings, fillDefaultFormatCodeSettings, KeyValueCache, ObjectUtils } from "../../utils";
import { Node, TextRange } from "../ast/common";
import { SourceFile } from "../ast/module";
import { FormatCodeSettings, UserPreferences, RenameOptions } from "./inputs";
import { Program } from "./Program";
import { DefinitionInfo, EmitOutput, FileTextChanges, ImplementationLocation, RenameLocation, TextChange, DiagnosticWithLocation, RefactorEditInfo, CodeFixAction,
    CombinedCodeActions } from "./results";

/** Host for implementing custom module and/or type reference directive resolution. */
export interface ResolutionHost {
    resolveModuleNames?: ts.LanguageServiceHost["resolveModuleNames"];
    getResolvedModuleWithFailedLookupLocationsFromCache?: ts.LanguageServiceHost["getResolvedModuleWithFailedLookupLocationsFromCache"];
    resolveTypeReferenceDirectives?: ts.LanguageServiceHost["resolveTypeReferenceDirectives"];
}

/**
 * Factory used to create a resolution host.
 * @remarks The compiler options are retrieved via a function in order to get the project's current compiler options.
 */
export type ResolutionHostFactory = (moduleResolutionHost: ts.ModuleResolutionHost, getCompilerOptions: () => ts.CompilerOptions) => ResolutionHost;

 /** @internal */
export interface LanguageServiceOptions {
    resolutionHost?: ResolutionHost;
}

export class LanguageService {
    private readonly _compilerObject: ts.LanguageService;
    private readonly _compilerHost: ts.CompilerHost;
    private _program: Program;
    /** @internal */
    private _context: ProjectContext;

    /**
     * Gets the compiler language service.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /** @private */
    constructor(context: ProjectContext, opts: LanguageServiceOptions) {
        const { resolutionHost = {} } = opts;
        this._context = context;

        let version = 0;
        const fileExistsSync = (path: string) => this._context.compilerFactory.containsSourceFileAtPath(path) || context.fileSystemWrapper.fileExistsSync(path);
        const languageServiceHost: ts.LanguageServiceHost = {
            getCompilationSettings: () => context.compilerOptions.get(),
            getNewLine: () => context.manipulationSettings.getNewLineKindAsString(),
            getScriptFileNames: () => this._context.compilerFactory.getSourceFilePaths(),
            getScriptVersion: fileName => {
                const sourceFile = this._context.compilerFactory.getSourceFileFromCacheFromFilePath(fileName);
                if (sourceFile == null)
                    return (version++).toString();
                return this._context.compilerFactory.documentRegistry.getSourceFileVersion(sourceFile.compilerNode);
            },
            getScriptSnapshot: fileName => {
                if (!fileExistsSync(fileName))
                    return undefined;
                return ts.ScriptSnapshot.fromString(this._context.compilerFactory.addOrGetSourceFileFromFilePath(fileName, { markInProject: false })!.getFullText());
            },
            getCurrentDirectory: () => context.fileSystemWrapper.getCurrentDirectory(),
            getDefaultLibFileName: options => {
                if (this._context.fileSystemWrapper.getFileSystem() instanceof DefaultFileSystemHost)
                    return ts.getDefaultLibFilePath(options);
                else
                    return FileUtils.pathJoin(context.fileSystemWrapper.getCurrentDirectory(), "node_modules/typescript/lib/" + ts.getDefaultLibFileName(options));
            },
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => {
                if (this._context.compilerFactory.containsSourceFileAtPath(path))
                    return this._context.compilerFactory.getSourceFileFromCacheFromFilePath(path)!.getFullText();
                return this._context.fileSystemWrapper.readFileSync(path, encoding);
            },
            fileExists: fileExistsSync,
            directoryExists: dirName => this._context.compilerFactory.containsDirectoryAtPath(dirName) || this._context.fileSystemWrapper.directoryExistsSync(dirName),
            resolveModuleNames: resolutionHost.resolveModuleNames,
            resolveTypeReferenceDirectives: resolutionHost.resolveTypeReferenceDirectives,
            getResolvedModuleWithFailedLookupLocationsFromCache: resolutionHost.getResolvedModuleWithFailedLookupLocationsFromCache
        };

        this._compilerHost = {
            getSourceFile: (fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) => {
                // todo: use languageVersion here?
                const sourceFile = this._context.compilerFactory.addOrGetSourceFileFromFilePath(fileName, { markInProject: false });
                return sourceFile == null ? undefined : sourceFile.compilerNode;
            },
            // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
            // getDefaultLibLocation: (...) => {},
            getDefaultLibFileName: (options: CompilerOptions) => languageServiceHost.getDefaultLibFileName(options),
            writeFile: (filePath, data, writeByteOrderMark, onError, sourceFiles) => {
                this._context.fileSystemWrapper.writeFileSync(filePath, writeByteOrderMark ? "\uFEFF" + data : data);
            },
            getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
            getDirectories: (path: string) => this._context.fileSystemWrapper.getDirectories(path),
            fileExists: (fileName: string) => languageServiceHost.fileExists!(fileName),
            readFile: (fileName: string) => languageServiceHost.readFile!(fileName),
            getCanonicalFileName: (fileName: string) => this._context.fileSystemWrapper.getStandardizedAbsolutePath(fileName),
            useCaseSensitiveFileNames: () => languageServiceHost.useCaseSensitiveFileNames!(),
            getNewLine: () => languageServiceHost.getNewLine!(),
            getEnvironmentVariable: (name: string) => process.env[name],
            directoryExists: dirName => languageServiceHost.directoryExists!(dirName),
            resolveModuleNames: resolutionHost.resolveModuleNames,
            resolveTypeReferenceDirectives: resolutionHost.resolveTypeReferenceDirectives
        };

        this._compilerObject = ts.createLanguageService(languageServiceHost, this._context.compilerFactory.documentRegistry);
        this._program = new Program(this._context, this._context.compilerFactory.getSourceFilePaths(), this._compilerHost);

        this._context.compilerFactory.onSourceFileAdded(() => this._resetProgram());
        this._context.compilerFactory.onSourceFileRemoved(() => this._resetProgram());
    }

    /**
     * Resets the program. This should be done whenever any modifications happen.
     * @internal
     */
    _resetProgram() {
        this._program._reset(this._context.compilerFactory.getSourceFilePaths(), this._compilerHost);
    }

    /**
     * Gets the language service's program.
     */
    getProgram() {
        return this._program;
    }

    /**
     * Rename the specified node.
     * @param node - Node to rename.
     * @param newName - New name for the node.
     * @param options - Options for renaming the node.
     */
    renameNode(node: Node, newName: string, options: RenameOptions = {}) {
        errors.throwIfWhitespaceOrNotString(newName, nameof(newName));

        if (node.getText() === newName)
            return;

        this.renameLocations(this.findRenameLocations(node, options), newName);
    }

    /**
     * Rename the provided rename locations.
     * @param renameLocations - Rename locations.
     * @param newName - New name for the node.
     */
    renameLocations(renameLocations: ReadonlyArray<RenameLocation>, newName: string) {
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
        return this.getDefinitionsAtPosition(node._sourceFile, node.getStart());
    }

    /**
     * Gets the definitions at the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position.
     */
    getDefinitionsAtPosition(sourceFile: SourceFile, pos: number): DefinitionInfo[] {
        const results = this.compilerObject.getDefinitionAtPosition(sourceFile.getFilePath(), pos) || [];
        return results.map(info => this._context.compilerFactory.getDefinitionInfo(info));
    }

    /**
     * Gets the implementations for the specified node.
     * @param node - Node.
     */
    getImplementations(node: Node): ImplementationLocation[] {
        return this.getImplementationsAtPosition(node._sourceFile, node.getStart());
    }

    /**
     * Gets the implementations at the specified position.
     * @param sourceFile - Source file.
     * @param pos - Position.
     */
    getImplementationsAtPosition(sourceFile: SourceFile, pos: number): ImplementationLocation[] {
        const results = this.compilerObject.getImplementationAtPosition(sourceFile.getFilePath(), pos) || [];
        return results.map(location => new ImplementationLocation(this._context, location));
    }

    /**
     * Finds references based on the specified node.
     * @param node - Node to find references for.
     */
    findReferences(node: Node) {
        return this.findReferencesAtPosition(node._sourceFile, node.getStart());
    }

    /**
     * Finds the nodes that reference the definition(s) of the specified node.
     * @param node - Node.
     */
    findReferencesAsNodes(node: Node) {
        const referencedSymbols = this.findReferences(node);
        return Array.from(getReferencingNodes());

        function* getReferencingNodes() {
            for (const referencedSymbol of referencedSymbols) {
                const isAlias = referencedSymbol.getDefinition().getKind() === ts.ScriptElementKind.alias;
                const references = referencedSymbol.getReferences();
                for (let i = 0; i < references.length; i++) {
                    // the first reference always seems to be the main definition... the other definitions
                    // could be constructed in initializers or elsewhere
                    const reference = references[i];
                    if (isAlias || !reference.isDefinition() || i > 0)
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
        return results.map(s => this._context.compilerFactory.getReferencedSymbol(s));
    }

    /**
     * Find the rename locations for the specified node.
     * @param node - Node to get the rename locations for.
     * @param options - Options for renaming.
     */
    findRenameLocations(node: Node, options: RenameOptions = {}): RenameLocation[] {
        const renameLocations = this.compilerObject.findRenameLocations(node._sourceFile.getFilePath(), node.getStart(),
            options.renameInStrings || false, options.renameInComments || false) || [];
        return renameLocations.map(l => new RenameLocation(this._context, l));
    }

    /**
     * Gets the suggestion diagnostics.
     * @param filePathOrSourceFile - The source file or file path to get suggestions for.
     */
    getSuggestionDiagnostics(filePathOrSourceFile: SourceFile | string): DiagnosticWithLocation[] {
        const filePath = this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
        const suggestionDiagnostics = this.compilerObject.getSuggestionDiagnostics(filePath);
        return suggestionDiagnostics.map(d => this._context.compilerFactory.getDiagnosticWithLocation(d));
    }

    /**
     * Gets the formatting edits for a range.
     * @param filePath - File path.
     * @param range - Position range.
     * @param formatSettings - Format code settings.
     */
    getFormattingEditsForRange(filePath: string, range: [number, number], formatSettings: FormatCodeSettings) {
        return (this.compilerObject.getFormattingEditsForRange(filePath, range[0], range[1], this._getFilledSettings(formatSettings)) || []).map(e => new TextChange(e));
    }

    /**
     * Gets the formatting edits for a document.
     * @param filePath - File path of the source file.
     * @param formatSettings - Format code settings.
     */
    getFormattingEditsForDocument(filePath: string, formatSettings: FormatCodeSettings) {
        return (this.compilerObject.getFormattingEditsForDocument(filePath, this._getFilledSettings(formatSettings)) || []).map(e => new TextChange(e));
    }

    /**
     * Gets the formatted text for a document.
     * @param filePath - File path of the source file.
     * @param formatSettings - Format code settings.
     */
    getFormattedDocumentText(filePath: string, formatSettings: FormatCodeSettings) {
        const sourceFile = this._context.compilerFactory.getSourceFileFromCacheFromFilePath(filePath);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(filePath);

        formatSettings = this._getFilledSettings(formatSettings);
        const formattingEdits = this.getFormattingEditsForDocument(filePath, formatSettings);
        let newText = getTextFromFormattingEdits(sourceFile, formattingEdits);
        const newLineChar = formatSettings.newLineCharacter!;

        if (formatSettings.ensureNewLineAtEndOfFile && !newText.endsWith(newLineChar))
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
        return new EmitOutput(this._context, filePath, this.compilerObject.getEmitOutput(filePath, emitOnlyDtsFiles));
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
            settings = this._context.manipulationSettings.getEditorSettings();
        else
            fillDefaultEditorSettings(settings, this._context.manipulationSettings);
        return this.compilerObject.getIndentationAtPosition(filePath, position, settings);
    }

    /**
     * Gets the file text changes for organizing the imports in a source file.
     *
     * @param sourceFile - Source file.
     * @param formatSettings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(sourceFile: SourceFile, formatSettings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
    /**
     * Gets the file text changes for organizing the imports in a source file.
     *
     * @param filePath - File path of the source file.
     * @param formatSettings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(filePath: string, formatSettings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
    organizeImports(filePathOrSourceFile: string | SourceFile, formatSettings: FormatCodeSettings = {}, userPreferences: UserPreferences = {}): FileTextChanges[] {
        const scope: ts.OrganizeImportsScope = {
            type: "file",
            fileName: this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile)
        };
        return this.compilerObject.organizeImports(scope, this._getFilledSettings(formatSettings), this._getFilledUserPreferences(userPreferences))
            .map(fileTextChanges => new FileTextChanges(this._context, fileTextChanges));
    }

    /**
     * Gets the edit information for applying a refactor at a the provided position in a source file.
     * @param filePathOrSourceFile - File path or source file to get the edits for.
     * @param formatSettings - Fomat code settings.
     * @param positionOrRange - Position in the source file where to apply given refactor.
     * @param refactorName - Refactor name.
     * @param actionName - Refactor action name.
     * @param preferences - User preferences for refactoring.
     */
    getEditsForRefactor(filePathOrSourceFile: string | SourceFile, formatSettings: FormatCodeSettings, positionOrRange: number | TextRange,
        refactorName: string, actionName: string, preferences: UserPreferences = {}): RefactorEditInfo | undefined
    {
        const filePath = this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
        const position = typeof positionOrRange === "number" ? positionOrRange : { pos: positionOrRange.getPos(), end: positionOrRange.getEnd() };
        const compilerObject = this.compilerObject.getEditsForRefactor(filePath, this._getFilledSettings(formatSettings),
            position, refactorName, actionName, this._getFilledUserPreferences(preferences));

        return compilerObject != null ? new RefactorEditInfo(this._context, compilerObject) : undefined;
    }

    /**
     * Gets file changes and actions to perform for the provided fixId.
     * @param filePathOrSourceFile - File path or source file to get the combined code fixes for.
     * @param fixId - Identifier for the code fix (ex. "fixMissingImport"). These ids are found in the `ts.codefix` namespace in the compiler api source.
     * @param formatSettings - Format code settings.
     * @param preferences - User preferences for refactoring.
     */
    getCombinedCodeFix(filePathOrSourceFile: string | SourceFile, fixId: {}, formatSettings: FormatCodeSettings = {}, preferences: UserPreferences = {}) {
        const compilerResult = this.compilerObject.getCombinedCodeFix({
            type: "file",
            fileName: this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile)
        }, fixId, this._getFilledSettings(formatSettings), this._getFilledUserPreferences(preferences || {}));

        return new CombinedCodeActions(this._context, compilerResult);
    }

    /**
     * Gets the edit information for applying a code fix at the provided text range in a source file.
     * @param filePathOrSourceFile - File path or source file to get the code fixes for.
     * @param start - Start position of the text range to be fixed.
     * @param end - End position of the text range to be fixed.
     * @param errorCodes - One or more error codes associated with the code fixes to retrieve.
     * @param formatOptions - Format code settings.
     * @param preferences - User preferences for refactoring.
     */
    getCodeFixesAtPosition(filePathOrSourceFile: string | SourceFile, start: number, end: number, errorCodes: ReadonlyArray<number>,
        formatOptions: FormatCodeSettings = {}, preferences: UserPreferences = {}): CodeFixAction[]
    {
        const filePath = this._getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
        const compilerResult = this.compilerObject.getCodeFixesAtPosition(filePath, start, end, errorCodes,
            this._getFilledSettings(formatOptions), this._getFilledUserPreferences(preferences || {}));

        return compilerResult.map(compilerObject => new CodeFixAction(this._context, compilerObject));
    }

    private _getFilePathFromFilePathOrSourceFile(filePathOrSourceFile: SourceFile | string) {
        const filePath = typeof filePathOrSourceFile === "string"
            ? this._context.fileSystemWrapper.getStandardizedAbsolutePath(filePathOrSourceFile)
            : filePathOrSourceFile.getFilePath();
        if (!this._context.compilerFactory.containsSourceFileAtPath(filePath))
            throw new errors.FileNotFoundError(filePath);
        return filePath;
    }

    private _getFilledSettings(settings: FormatCodeSettings) {
        if ((settings as any)["_filled"]) // optimization
            return settings;
        settings = ObjectUtils.assign(this._context.getFormatCodeSettings(), settings);
        fillDefaultFormatCodeSettings(settings, this._context.manipulationSettings);
        (settings as any)["_filled"] = true;
        return settings;
    }

    private _getFilledUserPreferences(userPreferences: UserPreferences) {
        return ObjectUtils.assign(this._context.getUserPreferences(), userPreferences);
    }
}
