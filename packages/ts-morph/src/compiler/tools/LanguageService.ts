import { createHosts, EditorSettings, errors, ObjectUtils, ResolutionHost, ts } from "@ts-morph/common";
import { getTextFromTextChanges } from "../../manipulation";
import { ProjectContext } from "../../ProjectContext";
import { fillDefaultEditorSettings, fillDefaultFormatCodeSettings } from "../../utils";
import { Node } from "../ast/common";
import { SourceFile } from "../ast/module";
import { FormatCodeSettings, RenameOptions, UserPreferences } from "./inputs";
import { Program } from "./Program";
import {
  CodeFixAction,
  CombinedCodeActions,
  DefinitionInfo,
  DiagnosticWithLocation,
  EmitOutput,
  FileTextChanges,
  ImplementationLocation,
  RefactorEditInfo,
  RenameLocation,
  TextChange,
} from "./results";

/** @internal */
export interface LanguageServiceCreationParams {
  context: ProjectContext;
  configFileParsingDiagnostics: ts.Diagnostic[];
  resolutionHost?: ResolutionHost;
  skipLoadingLibFiles: boolean | undefined;
  libFolderPath: string | undefined;
}

export class LanguageService {
  /** @internal */
  readonly #compilerObject: ts.LanguageService;
  /** @internal */
  readonly #compilerHost: ts.CompilerHost;
  /** @internal */
  #program: Program;
  /** @internal */
  #context: ProjectContext;
  /** @internal */
  #projectVersion = 0;

  /**
   * Gets the compiler language service.
   */
  get compilerObject() {
    return this.#compilerObject;
  }

  /** @private */
  constructor(params: LanguageServiceCreationParams) {
    this.#context = params.context;

    const { languageServiceHost, compilerHost } = createHosts({
      transactionalFileSystem: this.#context.fileSystemWrapper,
      sourceFileContainer: this.#context.getSourceFileContainer(),
      compilerOptions: this.#context.compilerOptions,
      getNewLine: () => this.#context.manipulationSettings.getNewLineKindAsString(),
      getProjectVersion: () => `${this.#projectVersion}`,
      resolutionHost: params.resolutionHost ?? {},
      libFolderPath: params.libFolderPath,
      skipLoadingLibFiles: params.skipLoadingLibFiles,
    });

    this.#compilerHost = compilerHost;
    this.#compilerObject = ts.createLanguageService(languageServiceHost, this.#context.compilerFactory.documentRegistry);
    this.#program = new Program({
      context: this.#context,
      rootNames: Array.from(this.#context.compilerFactory.getSourceFilePaths()),
      host: this.#compilerHost,
      configFileParsingDiagnostics: params.configFileParsingDiagnostics,
    });

    this.#context.compilerFactory.onSourceFileAdded(sourceFile => {
      // Only reset if the user is explicitly adding the source file.
      // Otherwise it might have just been the TypeScript compiler
      // doing some analysis and pulling in a new lib file or other file.
      if (sourceFile._isInProject())
        this._reset();
    });
    this.#context.compilerFactory.onSourceFileRemoved(() => this._reset());
  }

  /**
   * Resets the program. This should be done whenever any modifications happen.
   * @internal
   */
  _reset() {
    this.#projectVersion += 1;
    this.#program._reset(Array.from(this.#context.compilerFactory.getSourceFilePaths()), this.#compilerHost);
  }

  /**
   * Gets the language service's program.
   */
  getProgram() {
    return this.#program;
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
    return results.map(info => this.#context.compilerFactory.getDefinitionInfo(info));
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
    return results.map(location => new ImplementationLocation(this.#context, location));
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
    return results.map(s => this.#context.compilerFactory.getReferencedSymbol(s));
  }

  /**
   * Find the rename locations for the specified node.
   * @param node - Node to get the rename locations for.
   * @param options - Options for renaming.
   */
  findRenameLocations(node: Node, options: RenameOptions = {}): RenameLocation[] {
    const usePrefixAndSuffixText = options.usePrefixAndSuffixText == null
      ? this.#context.manipulationSettings.getUsePrefixAndSuffixTextForRename()
      : options.usePrefixAndSuffixText;
    const renameLocations = this.compilerObject.findRenameLocations(
      node._sourceFile.getFilePath(),
      node.getStart(),
      options.renameInStrings || false,
      options.renameInComments || false,
      usePrefixAndSuffixText,
    ) || [];
    return renameLocations.map(l => new RenameLocation(this.#context, l));
  }

  /**
   * Gets the suggestion diagnostics.
   * @param filePathOrSourceFile - The source file or file path to get suggestions for.
   */
  getSuggestionDiagnostics(filePathOrSourceFile: SourceFile | string): DiagnosticWithLocation[] {
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const suggestionDiagnostics = this.compilerObject.getSuggestionDiagnostics(filePath);
    return suggestionDiagnostics.map(d => this.#context.compilerFactory.getDiagnosticWithLocation(d));
  }

  /**
   * Gets the formatting edits for a range.
   * @param filePath - File path.
   * @param range - Position range.
   * @param formatSettings - Format code settings.
   */
  getFormattingEditsForRange(filePath: string, range: [number, number], formatSettings: FormatCodeSettings) {
    return (this.compilerObject.getFormattingEditsForRange(
      filePath,
      range[0],
      range[1],
      this.#getFilledSettings(formatSettings),
    ) || []).map(e => new TextChange(e));
  }

  /**
   * Gets the formatting edits for a document.
   * @param filePath - File path of the source file.
   * @param formatSettings - Format code settings.
   */
  getFormattingEditsForDocument(filePath: string, formatSettings: FormatCodeSettings) {
    const standardizedFilePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    return (this.compilerObject.getFormattingEditsForDocument(standardizedFilePath, this.#getFilledSettings(formatSettings)) || [])
      .map(e => new TextChange(e));
  }

  /**
   * Gets the formatted text for a document.
   * @param filePath - File path of the source file.
   * @param formatSettings - Format code settings.
   */
  getFormattedDocumentText(filePath: string, formatSettings: FormatCodeSettings) {
    const standardizedFilePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    const sourceFile = this.#context.compilerFactory.getSourceFileFromCacheFromFilePath(standardizedFilePath);
    if (sourceFile == null)
      throw new errors.FileNotFoundError(standardizedFilePath);

    formatSettings = this.#getFilledSettings(formatSettings);
    const formattingEdits = this.getFormattingEditsForDocument(standardizedFilePath, formatSettings);
    let newText = getTextFromTextChanges(sourceFile, formattingEdits);
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
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const compilerObject = this.compilerObject;
    return new EmitOutput(this.#context, getCompilerEmitOutput());

    function getCompilerEmitOutput(): ts.EmitOutput {
      const program = compilerObject.getProgram();
      if (program == null || program.getSourceFile(filePath) == null)
        return { emitSkipped: true, outputFiles: [] };
      return compilerObject.getEmitOutput(filePath, emitOnlyDtsFiles);
    }
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
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    if (settings == null)
      settings = this.#context.manipulationSettings.getEditorSettings();
    else
      fillDefaultEditorSettings(settings, this.#context.manipulationSettings);
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
  organizeImports(
    filePathOrSourceFile: string | SourceFile,
    formatSettings: FormatCodeSettings = {},
    userPreferences: UserPreferences = {},
  ): FileTextChanges[] {
    const scope: ts.OrganizeImportsArgs = {
      type: "file",
      fileName: this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile),
    };
    return this.compilerObject.organizeImports(scope, this.#getFilledSettings(formatSettings), this.#getFilledUserPreferences(userPreferences))
      .map(fileTextChanges => new FileTextChanges(this.#context, fileTextChanges));
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
  getEditsForRefactor(
    filePathOrSourceFile: string | SourceFile,
    formatSettings: FormatCodeSettings,
    positionOrRange: number | { getPos(): number; getEnd(): number },
    refactorName: string,
    actionName: string,
    preferences: UserPreferences = {},
  ): RefactorEditInfo | undefined {
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const position = typeof positionOrRange === "number" ? positionOrRange : { pos: positionOrRange.getPos(), end: positionOrRange.getEnd() };
    const compilerObject = this.compilerObject.getEditsForRefactor(
      filePath,
      this.#getFilledSettings(formatSettings),
      position,
      refactorName,
      actionName,
      this.#getFilledUserPreferences(preferences),
    );

    return compilerObject != null ? new RefactorEditInfo(this.#context, compilerObject) : undefined;
  }

  /**
   * Gets file changes and actions to perform for the provided fixId.
   * @param filePathOrSourceFile - File path or source file to get the combined code fixes for.
   * @param fixId - Identifier for the code fix (ex. "fixMissingImport"). These ids are found in the `ts.codefix` namespace in the compiler api source.
   * @param formatSettings - Format code settings.
   * @param preferences - User preferences for refactoring.
   */
  getCombinedCodeFix(filePathOrSourceFile: string | SourceFile, fixId: {}, formatSettings: FormatCodeSettings = {}, preferences: UserPreferences = {}) {
    const compilerResult = this.compilerObject.getCombinedCodeFix(
      {
        type: "file",
        fileName: this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile),
      },
      fixId,
      this.#getFilledSettings(formatSettings),
      this.#getFilledUserPreferences(preferences || {}),
    );

    return new CombinedCodeActions(this.#context, compilerResult);
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
  getCodeFixesAtPosition(
    filePathOrSourceFile: string | SourceFile,
    start: number,
    end: number,
    errorCodes: ReadonlyArray<number>,
    formatOptions: FormatCodeSettings = {},
    preferences: UserPreferences = {},
  ): CodeFixAction[] {
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const compilerResult = this.compilerObject.getCodeFixesAtPosition(
      filePath,
      start,
      end,
      errorCodes,
      this.#getFilledSettings(formatOptions),
      this.#getFilledUserPreferences(preferences || {}),
    );

    return compilerResult.map(compilerObject => new CodeFixAction(this.#context, compilerObject));
  }

  /** @internal */
  #getFilePathFromFilePathOrSourceFile(filePathOrSourceFile: SourceFile | string) {
    const filePath = typeof filePathOrSourceFile === "string"
      ? this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePathOrSourceFile)
      : filePathOrSourceFile.getFilePath();
    if (!this.#context.compilerFactory.containsSourceFileAtPath(filePath))
      throw new errors.FileNotFoundError(filePath);
    return filePath;
  }

  /** @internal */
  #getFilledSettings(settings: FormatCodeSettings) {
    if ((settings as any)["_filled"]) // optimization
      return settings;

    settings = Object.assign(this.#context.getFormatCodeSettings(), settings);
    fillDefaultFormatCodeSettings(settings, this.#context.manipulationSettings);
    (settings as any)["_filled"] = true;
    return settings;
  }

  /** @internal */
  #getFilledUserPreferences(userPreferences: UserPreferences) {
    return Object.assign(this.#context.getUserPreferences(), userPreferences);
  }
}
