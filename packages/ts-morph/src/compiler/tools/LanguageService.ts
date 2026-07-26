import { errors, SymbolFlags, SyntaxKind, ts } from "@ts-morph/common";
import { getTextFromTextChanges } from "../../manipulation";
import { ProjectContext } from "../../ProjectContext";
import { fillDefaultFormatCodeSettings } from "../../utils";
import { Node } from "../ast/common";
import { SourceFile } from "../ast/module";
import { FormatCodeSettings, RenameOptions } from "./inputs";
import { Program } from "./Program";
import {
  CodeFixAction,
  CombinedCodeActions,
  DefinitionInfo,
  Diagnostic,
  EmitOutput,
  FileTextChanges,
  ImplementationLocation,
  RenameLocation,
  TextChange,
} from "./results";

/** @internal */
export interface LanguageServiceCreationParams {
  context: ProjectContext;
  configFileParsingDiagnostics: ts.Diagnostic[];
  skipLoadingLibFiles: boolean | undefined;
  libFolderPath: string | undefined;
}

/**
 * Wrapper around the language service operations.
 *
 * Breaking change: tsgo has no `LanguageService` object. Every operation below
 * is a method on the session's project, which is what `compilerObject` returns,
 * and the operations tsgo does not implement are gone — see
 * `getEditsForRefactor` and `getIdentationAtPosition` in the breaking changes
 * list.
 */
export class LanguageService {
  /** @internal */
  #program: Program;
  /** @internal */
  #context: ProjectContext;
  /** @internal */
  #projectVersion = 0;

  /**
   * Gets the compiler object the language service operations are performed on.
   */
  get compilerObject(): ts.LanguageService {
    return this.#context.compilerFactory.documentRegistry.project;
  }

  /** @private */
  constructor(params: LanguageServiceCreationParams) {
    this.#context = params.context;
    this.#program = new Program({
      context: this.#context,
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
    this.#program._reset();
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
    const results = this.compilerObject.getDefinition(sourceFile.getFilePath(), pos);
    return results.map(span => this.#context.compilerFactory.getDefinitionInfo(this.#toDefinitionInfo(span)));
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
    const results = this.compilerObject.getImplementations(sourceFile.getFilePath(), pos);
    return results.map(span => new ImplementationLocation(this.#context, toDocumentSpan(span)));
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
    // tsgo resolves references from a node rather than from a bare position.
    const node = sourceFile.getDescendantAtPos(pos);
    if (node == null)
      return [];
    const entries = this.#context.compilerFactory.documentRegistry.checker.getReferencedSymbolsForNode(node.compilerNode, pos);
    return entries.map(entry => this.#context.compilerFactory.getReferencedSymbol(this.#toReferencedSymbol(entry)));
  }

  /**
   * Find the rename locations for the specified node.
   *
   * Breaking change: `newName` is now required. tsgo computes a rename as the
   * edits that perform it, so the locations cannot be found without knowing what
   * the node is being renamed to.
   * @param node - Node to get the rename locations for.
   * @param newName - New name the node is being renamed to.
   * @param options - Options for renaming.
   */
  findRenameLocations(node: Node, newName: string, options: RenameOptions = {}): RenameLocation[] {
    const usePrefixAndSuffixText = options.usePrefixAndSuffixText ?? this.#context.manipulationSettings.getUsePrefixAndSuffixTextForRename();
    const fileTextEdits = this.compilerObject.rename(node._sourceFile.getFilePath(), node.getStart(), newName, {
      useAliasesForRename: usePrefixAndSuffixText,
    });
    const locations: RenameLocation[] = [];
    for (const fileEdits of fileTextEdits) {
      for (const edit of fileEdits.edits) {
        locations.push(
          new RenameLocation(this.#context, {
            fileName: fileEdits.fileName,
            textSpan: toTextSpan(edit),
            // tsgo returns the replacement text rather than the surrounding text
            // it preserves, so the prefix and suffix are what is left of it.
            ...splitAroundName(edit.newText, newName),
          }),
        );
      }
    }
    if (options.renameInStrings || options.renameInComments)
      locations.push(...this.#findRenameLocationsInStringsAndComments(node, locations, options));
    return locations;
  }

  /**
   * Gets the suggestion diagnostics.
   * @param filePathOrSourceFile - The source file or file path to get suggestions for.
   */
  getSuggestionDiagnostics(filePathOrSourceFile: SourceFile | string): Diagnostic[] {
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const suggestionDiagnostics = this.#program.compilerObject.getSuggestionDiagnostics(filePath);
    return suggestionDiagnostics.map(d => this.#context.compilerFactory.getDiagnostic(d));
  }

  /**
   * Gets the formatting edits for a range.
   * @param filePath - File path.
   * @param range - Position range.
   * @param formatSettings - Format code settings.
   */
  getFormattingEditsForRange(filePath: string, range: [number, number], formatSettings: FormatCodeSettings) {
    const edits = this.compilerObject.formatDocumentRange(filePath, range[0], range[1], this.#getFilledSettings(formatSettings));
    return edits.map(e => new TextChange(toTextChange(e)));
  }

  /**
   * Gets the formatting edits for a document.
   * @param filePath - File path of the source file.
   * @param formatSettings - Format code settings.
   */
  getFormattingEditsForDocument(filePath: string, formatSettings: FormatCodeSettings) {
    const standardizedFilePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    const edits = this.compilerObject.formatDocument(standardizedFilePath, this.#getFilledSettings(formatSettings));
    return edits.map(e => new TextChange(toTextChange(e)));
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

    // `ensureNewLineAtEndOfFile` is applied here rather than by the formatter,
    // so its default has to be filled in before it is read.
    formatSettings = Object.assign(this.#context.getFormatCodeSettings(), formatSettings);
    fillDefaultFormatCodeSettings(formatSettings, this.#context.manipulationSettings);

    const formattingEdits = this.getFormattingEditsForDocument(standardizedFilePath, formatSettings);
    let newText = getTextFromTextChanges(sourceFile, formattingEdits);
    // tsgo's formatter has no newline option, so ts-morph normalizes line
    // endings itself, from its own manipulation settings.
    const newLineChar = this.#context.manipulationSettings.getNewLineKindAsString();

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
    if (this.#program.compilerObject.getSourceFile(filePath) == null)
      return new EmitOutput(this.#context, { emitSkipped: true, outputFiles: new Map(), diagnostics: [] });
    return new EmitOutput(this.#context, this.#program._getEmitOutputForFilePath(filePath, emitOnlyDtsFiles));
  }

  /**
   * Gets the file text changes for organizing the imports in a source file.
   *
   * Breaking change: the format settings and user preferences parameters are
   * gone. tsgo's organize-imports takes only a mode, which selects between
   * sorting, combining and removing unused imports.
   * @param filePathOrSourceFile - File path or source file to organize.
   * @param mode - Which of sorting, combining and removing unused to do.
   */
  organizeImports(filePathOrSourceFile: string | SourceFile, mode?: ts.OrganizeImportsMode): FileTextChanges[] {
    const fileName = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const edits = this.compilerObject.organizeImports(fileName, mode);
    if (edits.length === 0)
      return [];
    return [new FileTextChanges(this.#context, { fileName, textChanges: edits.map(toTextChange) })];
  }

  /**
   * Gets file changes and actions to perform for the provided fixId.
   * @param filePathOrSourceFile - File path or source file to get the combined code fixes for.
   * @param fixId - Identifier for the code fix (ex. "fixMissingImport").
   * @param formatSettings - Format code settings.
   *
   * Breaking change: the user preferences parameter is gone, and the fix ids are
   * tsgo's — `"fixMissingImport"`, `"fixMissingTypeAnnotationOnExports"` and
   * `"fixClassIncorrectlyImplementsInterface"` are the only ones that exist.
   */
  getCombinedCodeFix(filePathOrSourceFile: string | SourceFile, fixId: string, formatSettings: FormatCodeSettings = {}): CombinedCodeActions {
    const fileName = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const result = this.compilerObject.getCombinedCodeFix(fileName, fixId, this.#getFilledSettings(formatSettings));
    return new CombinedCodeActions(this.#context, { changes: result.changes.map(toFileTextChanges) });
  }

  /**
   * Gets the edit information for applying a code fix at the provided text range in a source file.
   * @param filePathOrSourceFile - File path or source file to get the code fixes for.
   * @param start - Start position of the text range to be fixed.
   * @param end - End position of the text range to be fixed.
   * @param errorCodes - One or more error codes associated with the code fixes to retrieve.
   *
   * Breaking change: the format settings and user preferences parameters are
   * gone. tsgo's code fixes take neither.
   */
  getCodeFixesAtPosition(
    filePathOrSourceFile: string | SourceFile,
    start: number,
    end: number,
    errorCodes: ReadonlyArray<number>,
  ): CodeFixAction[] {
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const fixes = this.compilerObject.getCodeFixes(filePath, start, end, errorCodes);
    return fixes.map(fix =>
      new CodeFixAction(this.#context, {
        description: fix.description,
        changes: fix.changes.map(toFileTextChanges),
      })
    );
  }

  /** @internal */
  #toDefinitionInfo(span: ts.FileSpan): ts.DefinitionInfo {
    // tsgo reports a definition as a span and nothing else, so the name is read
    // back out of the file and the kinds are what the symbol there says.
    const sourceFile = this.#context.compilerFactory.addOrGetSourceFileFromFilePath(
      this.#context.fileSystemWrapper.getStandardizedAbsolutePath(span.fileName),
      { markInProject: false, scriptKind: undefined },
    );
    // A definition reached through an alias comes back as the whole declaration
    // rather than the name that declares it — a definition is the name, and
    // callers locate the declaration by walking up from it.
    const nameSpan = getDeclarationNameSpan(sourceFile, span) ?? span;
    const name = sourceFile?.getFullText().substring(nameSpan.pos, nameSpan.end) ?? "";
    return {
      ...toDocumentSpan({ ...span, ...nameSpan }),
      kind: getScriptElementKind(this.#context.compilerFactory.documentRegistry.checker.getSymbolAtPosition(span.fileName, span.pos)),
      name,
      containerKind: ts.ScriptElementKind.unknown,
      containerName: "",
    };
  }

  /** @internal */
  #toReferencedSymbol(entry: ts.CompilerReferencedSymbolEntry): ts.ReferencedSymbol {
    // tsgo reports the definition as the whole declaration, while the references
    // are the identifiers that name it — including the one inside the definition.
    // Both the definition's span and "is this reference the definition?" are about
    // that name, so the declaration is narrowed to it first.
    const definitionNode = entry.definition.resolve();
    const definitionName = (definitionNode as { name?: ts.Node } | undefined)?.name;
    const isDefinitionNode = (node: ts.Node) =>
      // an anonymous `export default class {}` has no name to match, and the
      // reference tsgo reports for it is the `default` keyword on the declaration
      definitionName == null ? node.parent === definitionNode : node === definitionName;
    return {
      definition: {
        ...toNodeSpan(entry.definition.path, definitionName ?? definitionNode),
        kind: getScriptElementKind(entry.symbol),
        name: entry.symbol?.name ?? "",
        containerKind: ts.ScriptElementKind.unknown,
        containerName: "",
      },
      references: entry.references.map(handle => {
        const node = handle.resolve();
        return {
          ...toNodeSpan(handle.path, node),
          isWriteAccess: false,
          isDefinition: handle.path === entry.definition.path && node != null && isDefinitionNode(node),
        };
      }),
    };
  }

  /**
   * The rename locations that lie in a string or a comment rather than in code.
   *
   * tsgo's rename only visits code. TypeScript's `findInStrings`/`findInComments`
   * search is not ported — it survives only as the commented out block at
   * `internal/ls/findallreferences.go` — so the text scan happens here instead.
   * Every file the rename already touches is searched for the old name as a whole
   * word, and a match that is not a token of its own is kept when it sits inside a
   * string literal or a comment.
   * @internal
   */
  #findRenameLocationsInStringsAndComments(node: Node, codeLocations: RenameLocation[], options: RenameOptions): RenameLocation[] {
    const name = node.getText();
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name))
      return [];

    const takenByFile = new Map<string, Set<number>>();
    for (const location of codeLocations) {
      const fileName = location.getSourceFile().getFilePath();
      let taken = takenByFile.get(fileName);
      if (taken == null)
        takenByFile.set(fileName, taken = new Set());
      taken.add(location.getTextSpan().getStart());
    }
    takenByFile.set(node._sourceFile.getFilePath(), takenByFile.get(node._sourceFile.getFilePath()) ?? new Set());

    const locations: RenameLocation[] = [];
    for (const [fileName, taken] of takenByFile) {
      const sourceFile = this.#context.compilerFactory.getSourceFileFromCacheFromFilePath(
        this.#context.fileSystemWrapper.getStandardizedAbsolutePath(fileName),
      );
      if (sourceFile == null)
        continue;
      for (const pos of getWholeWordPositions(sourceFile.getFullText(), name)) {
        if (taken.has(pos) || !isInStringOrComment(sourceFile, pos, name.length, options))
          continue;
        locations.push(new RenameLocation(this.#context, { fileName, textSpan: { start: pos, length: name.length } }));
      }
    }
    return locations;
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
  #getFilledSettings(settings: FormatCodeSettings): ts.FormattingOptions {
    const filled = Object.assign(this.#context.getFormatCodeSettings(), settings);
    fillDefaultFormatCodeSettings(filled, this.#context.manipulationSettings);
    return {
      tabSize: filled.tabSize,
      indentSize: filled.indentSize,
      insertSpaces: filled.convertTabsToSpaces,
      indentStyle: filled.indentStyle,
      newLineCharacter: filled.newLineCharacter,
      trimTrailingWhitespace: filled.trimTrailingWhitespace,
    };
  }
}

/** The span a node occupies, from its first token rather than its leading trivia. */
function toNodeSpan(fileName: string, node: ts.Node | undefined): ts.DocumentSpan {
  if (node == null)
    return { fileName, textSpan: { start: 0, length: 0 } };
  const start = node.getStart();
  return { fileName, textSpan: { start, length: node.end - start } };
}

function toDocumentSpan(span: ts.FileSpan): ts.DocumentSpan {
  return { fileName: span.fileName, textSpan: toTextSpan(span) };
}

function toTextSpan(span: { pos: number; end: number }): ts.TextSpan {
  return { start: span.pos, length: span.end - span.pos };
}

function toTextChange(edit: ts.TextEdit): ts.TextChange {
  return { span: toTextSpan(edit), newText: edit.newText };
}

function toFileTextChanges(fileEdits: ts.FileTextEdits): ts.FileTextChanges {
  return { fileName: fileEdits.fileName, textChanges: fileEdits.edits.map(toTextChange) };
}

/**
 * The text a rename edit adds around the new name, which the `typescript`
 * package reported separately (`{ a }` renamed to `b` becomes `{ a: b }`).
 */
function splitAroundName(newText: string, newName: string): { prefixText?: string; suffixText?: string } {
  const index = newText.indexOf(newName);
  if (index === -1)
    return {};
  const prefixText = newText.substring(0, index);
  const suffixText = newText.substring(index + newName.length);
  return {
    prefixText: prefixText.length === 0 ? undefined : prefixText,
    suffixText: suffixText.length === 0 ? undefined : suffixText,
  };
}

/**
 * The span of the name of the declaration `span` covers, or `undefined` when the
 * span is not a whole declaration with a name.
 */
function getDeclarationNameSpan(sourceFile: SourceFile | undefined, span: { pos: number; end: number }): { pos: number; end: number } | undefined {
  const node = sourceFile?.getDescendantAtStartWithWidth(span.pos, span.end - span.pos);
  if (node == null || !Node.hasName(node))
    return undefined;
  const nameNode = node.getNameNode();
  return { pos: nameNode.getStart(), end: nameNode.getEnd() };
}

/** Every offset in `text` where `name` appears as a whole word. */
function* getWholeWordPositions(text: string, name: string): Iterable<number> {
  const isWordChar = (index: number) => index >= 0 && index < text.length && /[A-Za-z0-9_$]/.test(text[index]);
  let pos = text.indexOf(name);
  while (pos !== -1) {
    if (!isWordChar(pos - 1) && !isWordChar(pos + name.length))
      yield pos;
    pos = text.indexOf(name, pos + name.length);
  }
}

/** Whether a match at `pos` is inside a string literal's text or a comment. */
function isInStringOrComment(sourceFile: SourceFile, pos: number, length: number, options: RenameOptions): boolean {
  const node = sourceFile.getDescendantAtPos(pos);
  if (node == null)
    return false;
  // comments in a statement, member or property position are nodes of their own
  if (node.getKind() === SyntaxKind.SingleLineCommentTrivia || node.getKind() === SyntaxKind.MultiLineCommentTrivia)
    return !!options.renameInComments;
  const start = node.getStart();
  // a match at or after the token's start is part of the token — only the text
  // between a string literal's quotes counts, everything else is code
  if (pos >= start)
    return !!options.renameInStrings && isStringLike(node) && pos > start && pos + length < node.getEnd();
  // otherwise it is in the trivia before the token, which is a comment or nothing
  return !!options.renameInComments && node.getLeadingCommentRanges().some(range => pos >= range.getPos() && pos + length <= range.getEnd());
}

function isStringLike(node: Node): boolean {
  return Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node) || Node.isTemplateHead(node)
    || Node.isTemplateMiddle(node) || Node.isTemplateTail(node);
}

/**
 * What kind of element a symbol declares. tsgo does not classify definitions,
 * so this is derived from the symbol's flags; see `ts.ScriptElementKind` for the
 * members that survived.
 */
function getScriptElementKind(symbol: ts.Symbol | undefined): ts.ScriptElementKind {
  if (symbol == null)
    return ts.ScriptElementKind.unknown;
  const flags = symbol.flags;
  if (flags & SymbolFlags.Alias)
    return ts.ScriptElementKind.alias;
  if (flags & SymbolFlags.Class)
    return ts.ScriptElementKind.class;
  if (flags & SymbolFlags.Interface)
    return ts.ScriptElementKind.interfaceElement;
  if (flags & SymbolFlags.RegularEnum || flags & SymbolFlags.ConstEnum)
    return ts.ScriptElementKind.enumElement;
  if (flags & SymbolFlags.EnumMember)
    return ts.ScriptElementKind.enumMemberElement;
  if (flags & SymbolFlags.TypeAlias)
    return ts.ScriptElementKind.typeElement;
  if (flags & SymbolFlags.TypeParameter)
    return ts.ScriptElementKind.typeParameterElement;
  if (flags & SymbolFlags.Module)
    return ts.ScriptElementKind.moduleElement;
  if (flags & SymbolFlags.GetAccessor)
    return ts.ScriptElementKind.memberGetAccessorElement;
  if (flags & SymbolFlags.SetAccessor)
    return ts.ScriptElementKind.memberSetAccessorElement;
  if (flags & SymbolFlags.Method)
    return ts.ScriptElementKind.memberFunctionElement;
  if (flags & SymbolFlags.Property)
    return ts.ScriptElementKind.memberVariableElement;
  if (flags & SymbolFlags.Function)
    return ts.ScriptElementKind.functionElement;
  if (flags & SymbolFlags.FunctionScopedVariable)
    return ts.ScriptElementKind.parameterElement;
  if (flags & SymbolFlags.Variable)
    return ts.ScriptElementKind.variableElement;
  return ts.ScriptElementKind.unknown;
}
