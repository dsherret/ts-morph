import { errors, isReconstructedNode, SymbolFlags, SyntaxKind, ts } from "@ts-morph/common";
import { getTextFromTextChanges } from "../../manipulation";
import { ProjectContext } from "../../ProjectContext";
import { fillDefaultFormatCodeSettings } from "../../utils";
import { ClassDeclaration, ClassExpression } from "../ast/class";
import { Node } from "../ast/common";
import { BinaryExpression } from "../ast/expression";
import { QuoteKind } from "../ast/literal";
import { ExportDeclaration, ExportSpecifier, ImportDeclaration, ImportSpecifier, ModuleDeclaration, ModuleDeclarationKind, SourceFile } from "../ast/module";
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
 * The compiler has no language service object of its own: every operation below
 * is a method on the session's project, which is what `compilerObject` returns.
 * Operations the compiler does not implement, such as refactors, are absent —
 * see BREAKING-CHANGES.md for the list.
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
    if (results.length === 0)
      return [];
    // the node asking is what a container name is qualified against, so it is
    // resolved once here rather than per definition
    const askingNode = sourceFile.getDescendantAtPos(pos);
    return this.#toSignatureDefinitions(askingNode, results)
      .map(span => this.#context.compilerFactory.getDefinitionInfo(this.#toDefinitionInfo(span, askingNode)));
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
    return results.map(span => new ImplementationLocation(this.#context, toDocumentSpan(span), () => this.#getImplementationKind(span)));
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
    const originFilePath = node._sourceFile.getFilePath();
    const originStart = node.getStart();
    return Array.from(getReferencingNodes());

    function* getReferencingNodes() {
      for (const referencedSymbol of referencedSymbols) {
        const isAlias = referencedSymbol.getDefinition().getKind() === ts.ScriptElementKind.alias;
        const references = referencedSymbol.getReferences();
        // this group is the one the search started from, so its leading definition
        // is the node being searched for rather than a reference to it. tsgo also
        // flags the *declaring* file's entry as a definition, where the `typescript`
        // package only flagged the origin's — dropping those would lose a real
        // reference, so the check is scoped to the origin's own group.
        const isOriginGroup = references.some(r => r.getSourceFile().getFilePath() === originFilePath && r.getNode().getStart() === originStart);
        for (let i = 0; i < references.length; i++) {
          // the first reference always seems to be the main definition... the other definitions
          // could be constructed in initializers or elsewhere
          const reference = references[i];
          if (isAlias || !reference.isDefinition() || i > 0 || !isOriginGroup)
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
    // tsgo resolves references from a node rather than from a bare position, so
    // the position is resolved to a node here on the terms the `typescript`
    // package used.
    const location = getReferenceLocationAtPosition(sourceFile, pos);
    if (location == null)
      return [];
    const entries = this.#context.compilerFactory.documentRegistry.checker.getReferencedSymbolsForNode(location, pos);
    return entries.map(entry => this.#context.compilerFactory.getReferencedSymbol(this.#toReferencedSymbol(entry)));
  }

  /**
   * Find the rename locations for the specified node.
   *
   * `newName` is required: the compiler computes a rename as the edits that
   * perform it, so the locations cannot be found without knowing what the node
   * is being renamed to.
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
    const filled = this.#fillSettings(formatSettings);
    const edits = this.compilerObject.formatDocumentRange(filePath, range[0], range[1], toFormattingOptions(filled));
    return this.#withBraceSpacing(filePath, edits, filled, range).map(e => new TextChange(toTextChange(e)));
  }

  /**
   * Gets the formatting edits for a document.
   * @param filePath - File path of the source file.
   * @param formatSettings - Format code settings.
   */
  getFormattingEditsForDocument(filePath: string, formatSettings: FormatCodeSettings) {
    const standardizedFilePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    const filled = this.#fillSettings(formatSettings);
    const edits = this.compilerObject.formatDocument(standardizedFilePath, toFormattingOptions(filled));
    return this.#withBraceSpacing(standardizedFilePath, edits, filled).map(e => new TextChange(toTextChange(e)));
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
    // The caller decides, the way it did before; the manipulation setting is only
    // the default. tsgo does take a newline option — the same setting reaches it
    // through getCombinedCodeFix — so overriding one here would honour it on one
    // path and ignore it on another.
    const newLineChar = formatSettings.newLineCharacter ?? this.#context.manipulationSettings.getNewLineKindAsString();

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
   * Takes no format settings or user preferences: the compiler's
   * organize-imports takes only a mode, which selects between sorting,
   * combining and removing unused imports.
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
   * There is no user preferences parameter, and three fix ids exist:
   * `"fixMissingImport"`, `"fixMissingTypeAnnotationOnExports"` and
   * `"fixClassIncorrectlyImplementsInterface"`.
   */
  getCombinedCodeFix(filePathOrSourceFile: string | SourceFile, fixId: string, formatSettings: FormatCodeSettings = {}): CombinedCodeActions {
    const fileName = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    const settings = toFormattingOptions(this.#fillSettings(formatSettings));
    const result = this.compilerObject.getCombinedCodeFix(fileName, fixId, settings, this.#getQuotePreference());
    return new CombinedCodeActions(this.#context, { changes: result.changes.map(toFileTextChanges) });
  }

  /**
   * Gets the edit information for applying a code fix at the provided text range in a source file.
   * @param filePathOrSourceFile - File path or source file to get the code fixes for.
   * @param start - Start position of the text range to be fixed.
   * @param end - End position of the text range to be fixed.
   * @param errorCodes - One or more error codes associated with the code fixes to retrieve.
   *
   * Takes no format settings or user preferences: the compiler's code fixes
   * accept neither.
   */
  getCodeFixesAtPosition(
    filePathOrSourceFile: string | SourceFile,
    start: number,
    end: number,
    errorCodes: ReadonlyArray<number>,
  ): CodeFixAction[] {
    const filePath = this.#getFilePathFromFilePathOrSourceFile(filePathOrSourceFile);
    // No error code selects no fix. tsgo reads an empty list as "every code"
    // rather than "no code", so the request is answered here instead.
    if (errorCodes.length === 0)
      return [];
    const fixes = this.compilerObject.getCodeFixes(filePath, start, end, errorCodes, this.#getQuotePreference());
    return fixes.map(fix =>
      new CodeFixAction(this.#context, {
        description: fix.description,
        changes: fix.changes.map(toFileTextChanges),
      })
    );
  }

  /**
   * The definitions of an overloaded declaration, narrowed to the ones the
   * `typescript` package reported.
   *
   * tsgo answers a position with every declaration the symbol there has, in
   * source order, so asking on the name of an overloaded function or method
   * leads with a signature rather than with the implementation. The `typescript`
   * package answered with the implementations when the symbol had any and with
   * the last signature otherwise, and only when the position was the name of a
   * function-like declaration — a call site is already answered by the overload
   * it resolves to, and a plain reference still reports every declaration.
   * @internal
   */
  #toSignatureDefinitions(askingNode: Node | undefined, spans: readonly ts.FileSpan[]): readonly ts.FileSpan[] {
    if (spans.length < 2 || !isNameOfFunctionLikeDeclaration(askingNode))
      return spans;
    const definitions = spans.map(span => ({ span, declaration: getDeclarationOfSpanNode(this.#getSpanNode(span)) }));
    // narrowing a set that is not fully understood could drop the very declaration
    // the caller wanted, so a span that cannot be placed in its file stops the filter
    if (definitions.some(definition => definition.declaration == null))
      return spans;
    // a symbol may also be declared by something that is not a signature at all
    // (a function merged with a namespace), and those declarations drop out
    const signatures = definitions.filter(definition => isFunctionLike(definition.declaration!));
    if (signatures.length === 0)
      return spans;
    const implementations = signatures.filter(definition => Node.hasBody(definition.declaration!));
    return (implementations.length > 0 ? implementations : [signatures[signatures.length - 1]]).map(definition => definition.span);
  }

  /**
   * What kind of element an implementation is.
   *
   * tsgo reports an implementation as a span alone, so the kind is derived from
   * the symbol at the span, the same way a definition's is. An object literal
   * implements an interface without declaring a symbol that says so, which is
   * why the `typescript` package classified that one by its node instead.
   * @internal
   */
  #getImplementationKind(span: ts.FileSpan): ts.ScriptElementKind {
    if (Node.isObjectLiteralExpression(this.#getSpanNode(span)))
      return ts.ScriptElementKind.interfaceElement;
    return getScriptElementKind(this.#context.compilerFactory.documentRegistry.checker.getSymbolAtPosition(span.fileName, span.pos));
  }

  /** The node a span covers, or undefined when its file does not exist or nothing has exactly that extent. @internal */
  #getSpanNode(span: ts.FileSpan): Node | undefined {
    return this.#getSpanSourceFile(span)?.getDescendantAtStartWithWidth(span.pos, span.end - span.pos);
  }

  /** The file a span is in, pulled into the project's cache without joining the project. @internal */
  #getSpanSourceFile(span: ts.FileSpan): SourceFile | undefined {
    return this.#context.compilerFactory.addOrGetSourceFileFromFilePath(
      this.#context.fileSystemWrapper.getStandardizedAbsolutePath(span.fileName),
      { markInProject: false, scriptKind: undefined },
    );
  }

  /** @internal */
  #toDefinitionInfo(span: ts.FileSpan, askingNode: Node | undefined): ts.DefinitionInfo {
    // tsgo reports a definition as a span and nothing else, so the name is read
    // back out of the file and the kinds are what the symbol there says.
    // A definition reached through an alias comes back as the whole declaration
    // rather than the name that declares it — a definition is the name, and
    // callers locate the declaration by walking up from it.
    const sourceFile = this.#getSpanSourceFile(span);
    const node = sourceFile?.getDescendantAtStartWithWidth(span.pos, span.end - span.pos);
    const nameSpan = getDeclarationNameSpan(node) ?? span;
    const name = sourceFile?.getFullText().substring(nameSpan.pos, nameSpan.end) ?? "";
    const symbol = this.#context.compilerFactory.documentRegistry.checker.getSymbolAtPosition(span.fileName, span.pos);
    return {
      ...toDocumentSpan({ ...span, ...nameSpan }),
      kind: getScriptElementKind(symbol),
      name,
      containerKind: ts.ScriptElementKind.unknown,
      containerName: getDefinitionContainerName(node, askingNode) || this.#getModuleContainerName(symbol, askingNode),
    };
  }

  /**
   * The module holding a definition its file declares directly, named the way the
   * asking file would import it.
   *
   * Such a definition's container is the file's own module symbol, which nothing
   * in the text names — TypeScript wrote the module specifier there instead, and
   * only the checker knows which specifier reaches that file from here. A package
   * under `node_modules` reads as its package name rather than as a path.
   * @internal
   */
  #getModuleContainerName(symbol: ts.Symbol | undefined, askingNode: Node | undefined): string {
    const container = symbol?.getParent();
    if (container == null || (container.flags & SymbolFlags.Module) === 0)
      return "";
    // a rebuilt node has no handle to name the asking file with, so the file itself asks
    const location = askingNode == null || isReconstructedNode(askingNode.compilerNode) ? askingNode?._sourceFile.compilerNode : askingNode.compilerNode;
    return this.#context.compilerFactory.documentRegistry.checker.symbolToString(container, location);
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
    // the definition's name is its display text — "function myFunction(): void"
    // rather than "myFunction" — which is what the classified runs spell out
    const displayParts = entry.displayParts.map(part => ({ text: part.text, kind: part.kind }));
    return {
      definition: {
        ...toNodeSpan(entry.definition.path, definitionName ?? definitionNode),
        kind: getScriptElementKind(entry.symbol),
        name: displayParts.length > 0 ? displayParts.map(part => part.text).join("") : entry.symbol?.name ?? "",
        displayParts,
        containerKind: ts.ScriptElementKind.unknown,
        containerName: "",
      },
      references: entry.references
        // a handle names a node by its index in the file tsgo parsed, and index
        // zero is the "no such node" sentinel. A reference tsgo scans into being
        // rather than parses — the `constructor` keyword a constructor search
        // reports for the declaration it started from — has no index of its own,
        // so it arrives as zero and would resolve to whatever the sentinel slot
        // happens to hold. See the breaking changes list.
        .map((handle, i) => ({ handle, isWriteAccess: entry.writeAccess[i] ?? false }))
        .filter(({ handle }) => handle.index !== 0)
        .map(({ handle, isWriteAccess }) => {
          const node = handle.resolve();
          return {
            ...toNodeSpan(handle.path, node),
            isWriteAccess,
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

  /**
   * The quotes a code fix should write a new string literal with.
   *
   * This is the one user preference the compiler takes on a request. The rest of
   * `ManipulationSettingsContainer#getUserPreferences()` has nowhere to go.
   * @internal
   */
  #getQuotePreference(): ts.QuotePreference {
    return this.#context.manipulationSettings.getQuoteKind() === QuoteKind.Single ? "single" : "double";
  }

  /**
   * The formatter's edits, with the one brace setting tsgo's formatter does not
   * take applied to them.
   *
   * tsgo always writes `{ a }`, so
   * `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false` closes the gap
   * on the inside of each brace here instead. Only the space between two tokens is
   * ever rewritten, so a brace written inside a string, a template, a comment or
   * JSX text — none of which are brace tokens — cannot be reached.
   * @internal
   */
  #withBraceSpacing(
    filePath: string,
    edits: readonly ts.TextEdit[],
    settings: FormatCodeSettings,
    range?: [number, number],
  ): readonly ts.TextEdit[] {
    if (settings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces !== false)
      return edits;
    const sourceFile = this.#context.compilerFactory.getSourceFileFromCacheFromFilePath(
      this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath),
    );
    return sourceFile == null ? edits : closeUpSpacesInsideBraces(sourceFile, edits, range);
  }

  /** @internal */
  #fillSettings(settings: FormatCodeSettings): FormatCodeSettings {
    const filled = Object.assign(this.#context.getFormatCodeSettings(), settings);
    fillDefaultFormatCodeSettings(filled, this.#context.manipulationSettings);
    return filled;
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
 * The node find-references answers a position with, or `undefined` when the
 * position has no answer.
 *
 * The `typescript` package resolved a position to the token it touches and then
 * to what that token stands for — the `class` keyword stands for the name of the
 * class it opens — and looked the symbol up there. tsgo makes the same second
 * step on any node it is handed, so a token the compiler stores is passed
 * straight through. A rebuilt token has no compiler handle, so what it stands
 * for is worked out here and that is asked about instead; when it stands for
 * nothing there is no symbol to find and the position simply has no references,
 * which is what the `typescript` package answered too.
 */
function getReferenceLocationAtPosition(sourceFile: SourceFile, pos: number): ts.Node | undefined {
  const token = getTouchingPropertyName(sourceFile, pos);
  if (token == null)
    return undefined;
  if (!isReconstructedNode(token.compilerNode))
    return token.compilerNode;
  const adjusted = getAdjustedReferenceLocation(token);
  return adjusted != null && !isReconstructedNode(adjusted.compilerNode) ? adjusted.compilerNode : undefined;
}

/**
 * The token a position touches, which is where find-references starts.
 *
 * A position belongs to the token whose text covers it. It also belongs to a
 * token that ends exactly there, when that token is a name, a keyword or a
 * private identifier — `class C|` is still asking about `C` — and that reading
 * wins over the token starting there. Leading trivia belongs to no token, so a
 * position inside it resolves to the node enclosing it rather than to the token
 * that follows. This is the `typescript` package's `getTouchingPropertyName`.
 */
function getTouchingPropertyName(sourceFile: SourceFile, pos: number): Node | undefined {
  if (pos < 0 || pos > sourceFile.getEnd())
    return undefined;
  let current: Node = sourceFile;
  while (true) {
    let containing: Node | undefined;
    let endingHere: Node | undefined;
    for (const child of current.getChildren()) {
      const end = child.getEnd();
      if (end < pos)
        continue;
      if (getStartIncludingJsDoc(child) > pos)
        break;
      if (pos < end || child.getKind() === SyntaxKind.EndOfFile) {
        containing = child;
        break;
      }
      // a zero width child — an empty syntax list — is not something a position
      // can be at the end of
      if (end > child.getPos())
        endingHere = child;
    }
    if (endingHere != null) {
      const preceding = getLastToken(endingHere);
      if (isTouchedByPositionAtEnd(preceding))
        return preceding;
    }
    if (containing == null)
      return current;
    current = containing;
  }
}

/**
 * Where a node's text begins, counting the jsdoc that documents it.
 *
 * jsdoc is part of what it documents, so a position inside it belongs to the
 * documented node rather than to the trivia before it. A syntax list has no
 * jsdoc of its own and takes its start from its first child, which is how a
 * position in the jsdoc of a file's first statement reaches that statement.
 */
function getStartIncludingJsDoc(node: Node): number {
  if (node.getKind() !== SyntaxKind.SyntaxList)
    return node.getStart(true);
  const first = node.getChildren()[0];
  return first == null ? node.getStart(true) : getStartIncludingJsDoc(first);
}

/** The last token of a node's text, which is the node itself when it has no children. */
function getLastToken(node: Node): Node {
  let current = node;
  while (true) {
    const children = current.getChildren();
    let last: Node | undefined;
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].getEnd() > children[i].getPos()) {
        last = children[i];
        break;
      }
    }
    if (last == null)
      return current;
    current = last;
  }
}

/** The tokens a position at their end still asks about: names, keywords and private identifiers. */
function isTouchedByPositionAtEnd(node: Node): boolean {
  const kind = node.getKind();
  if (kind >= SyntaxKind.FirstKeyword && kind <= SyntaxKind.LastKeyword)
    return true;
  switch (kind) {
    case SyntaxKind.Identifier:
    case SyntaxKind.NoSubstitutionTemplateLiteral:
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.PrivateIdentifier:
    case SyntaxKind.StringLiteral:
      return true;
    default:
      return false;
  }
}

/**
 * What a token stands for when references are asked at it.
 *
 * This is the `typescript` package's `getAdjustedReferenceLocation`, narrowed to
 * the tokens tsgo does not store — the keywords that open a declaration or apply
 * to an expression. tsgo ports the same function and runs it on whatever it is
 * handed, so the cases for nodes it does store are left to it; only a rebuilt
 * token, which it can never be handed, is resolved here.
 */
function getAdjustedReferenceLocation(token: Node): Node | undefined {
  const parent = token.getParent();
  if (parent == null)
    return undefined;
  switch (token.getKind()) {
    // the expression forms are not adjusted by the `typescript` package's
    // adjustment at all — its checker answers a `class` or `function` keyword with
    // the symbol of what the keyword opens, which is the same answer by another
    // road, and asking about the name is how to reach it from here
    case SyntaxKind.ClassKeyword:
      return Node.isClassDeclaration(parent) || Node.isClassExpression(parent) ? getAdjustedLocationForDeclaration(parent) : undefined;
    case SyntaxKind.FunctionKeyword:
      return Node.isFunctionDeclaration(parent) || Node.isFunctionExpression(parent) ? getAdjustedLocationForDeclaration(parent) : undefined;
    case SyntaxKind.InterfaceKeyword:
      return Node.isInterfaceDeclaration(parent) ? getAdjustedLocationForDeclaration(parent) : undefined;
    case SyntaxKind.EnumKeyword:
      return Node.isEnumDeclaration(parent) ? getAdjustedLocationForDeclaration(parent) : undefined;
    case SyntaxKind.ModuleKeyword:
    case SyntaxKind.NamespaceKeyword:
      return Node.isModuleDeclaration(parent) ? getAdjustedLocationForDeclaration(parent) : undefined;
    case SyntaxKind.GetKeyword:
      return Node.isGetAccessorDeclaration(parent) ? getAdjustedLocationForDeclaration(parent) : undefined;
    case SyntaxKind.SetKeyword:
      return Node.isSetAccessorDeclaration(parent) ? getAdjustedLocationForDeclaration(parent) : undefined;
    // the `typescript` package read the class's symbol off the keyword and then
    // searched for constructors; tsgo reads the same symbol off the declaration
    // and makes the same search, so the declaration is what it is asked about
    case SyntaxKind.ConstructorKeyword:
      return Node.isConstructorDeclaration(parent) ? parent : undefined;
    case SyntaxKind.TypeKeyword:
      return getAdjustedLocationForTypeKeyword(parent);
    // `var x`, `let x` and `const x` are the one name they declare
    case SyntaxKind.ConstKeyword:
    case SyntaxKind.LetKeyword:
    case SyntaxKind.VarKeyword:
      return getAdjustedLocationForVariableKeyword(parent);
    case SyntaxKind.ImportKeyword:
      if (Node.isImportEqualsDeclaration(parent))
        return getAdjustedLocationForDeclaration(parent);
      return Node.isImportDeclaration(parent) ? getAdjustedLocationForImportDeclaration(parent) : undefined;
    case SyntaxKind.ExportKeyword:
      if (Node.isExportDeclaration(parent))
        return getAdjustedLocationForExportDeclaration(parent);
      // `export default x` and `export = x` are the expression they export
      return Node.isExportAssignment(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    case SyntaxKind.AsKeyword:
      return getAdjustedLocationForAsKeyword(parent);
    case SyntaxKind.RequireKeyword:
      return Node.isExternalModuleReference(parent) ? parent.getExpression() : undefined;
    case SyntaxKind.FromKeyword:
      return Node.isImportDeclaration(parent) || Node.isExportDeclaration(parent) ? parent.getModuleSpecifier() : undefined;
    case SyntaxKind.ExtendsKeyword:
    case SyntaxKind.ImplementsKeyword:
      return getAdjustedLocationForExtendsOrImplements(token, parent);
    case SyntaxKind.InferKeyword:
      return Node.isInferTypeNode(parent) ? parent.getTypeParameter().getNameNode() : undefined;
    // `keyof T` and `readonly T[]` are the type they operate on
    case SyntaxKind.KeyOfKeyword:
    case SyntaxKind.ReadonlyKeyword:
      return getAdjustedLocationForTypeOperator(token, parent);
    case SyntaxKind.InKeyword:
      return getAdjustedLocationForInKeyword(token, parent);
    // a unary keyword is the expression it applies to
    case SyntaxKind.AwaitKeyword:
      return Node.isAwaitExpression(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    case SyntaxKind.DeleteKeyword:
      return Node.isDeleteExpression(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    case SyntaxKind.NewKeyword:
      return Node.isNewExpression(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    case SyntaxKind.TypeOfKeyword:
      return Node.isTypeOfExpression(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    case SyntaxKind.VoidKeyword:
      return Node.isVoidExpression(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    case SyntaxKind.YieldKeyword:
      return Node.isYieldExpression(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    case SyntaxKind.InstanceOfKeyword:
      return isOperatorOfBinaryExpression(token, parent) ? skipOuterExpressions(parent.getRight()) : undefined;
    case SyntaxKind.OfKeyword:
      return Node.isForOfStatement(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
    default:
      return undefined;
  }
}

/** The name a declaration declares, or what names it when it has no name of its own. */
function getAdjustedLocationForDeclaration(declaration: Node): Node | undefined {
  if (Node.hasName(declaration))
    return declaration.getNameNode();
  // an unnamed `export default class {}` is named by its `default` modifier
  if (Node.isClassDeclaration(declaration) || Node.isFunctionDeclaration(declaration))
    return declaration.getFirstModifierByKind(SyntaxKind.DefaultKeyword);
  return undefined;
}

/** What the `type` of a type alias, a type only import, or a type only export stands for. */
function getAdjustedLocationForTypeKeyword(parent: Node): Node | undefined {
  if (Node.isTypeAliasDeclaration(parent))
    return parent.getNameNode();
  if (Node.isImportClause(parent) && parent.isTypeOnly()) {
    const declaration = parent.getParent();
    return Node.isImportDeclaration(declaration) ? getAdjustedLocationForImportDeclaration(declaration) : undefined;
  }
  return Node.isExportDeclaration(parent) && parent.isTypeOnly() ? getAdjustedLocationForExportDeclaration(parent) : undefined;
}

/** The name a `var`, `let` or `const` declares, when it declares exactly one. */
function getAdjustedLocationForVariableKeyword(parent: Node): Node | undefined {
  if (!Node.isVariableDeclarationList(parent))
    return undefined;
  const declarations = parent.getDeclarations();
  if (declarations.length !== 1)
    return undefined;
  const name = declarations[0].getNameNode();
  return Node.isIdentifier(name) ? name : undefined;
}

/**
 * What an import declaration stands for: the one name it brings in, or the
 * module it names when it brings in more than one name or none.
 */
function getAdjustedLocationForImportDeclaration(declaration: ImportDeclaration): Node | undefined {
  const importClause = declaration.getImportClause();
  if (importClause != null) {
    const namedBindings = importClause.getNamedBindings();
    const defaultImport = importClause.getDefaultImport();
    if (defaultImport != null) {
      // a default import alongside named bindings names two things, so neither
      return namedBindings == null ? defaultImport : undefined;
    }
    if (Node.isNamedImports(namedBindings)) {
      const elements = namedBindings.getElements();
      return elements.length === 1 ? getSpecifierLocalName(elements[0]) : undefined;
    }
    if (Node.isNamespaceImport(namedBindings))
      return namedBindings.getNameNode();
  }
  return declaration.getModuleSpecifier();
}

/** The same for an export declaration. */
function getAdjustedLocationForExportDeclaration(declaration: ExportDeclaration): Node | undefined {
  const namespaceExport = declaration.getNamespaceExport();
  if (namespaceExport != null)
    return namespaceExport.getNameNode();
  const namedExports = declaration.getFirstChildByKind(SyntaxKind.NamedExports);
  if (namedExports != null) {
    const elements = namedExports.getElements();
    return elements.length === 1 ? getSpecifierLocalName(elements[0]) : undefined;
  }
  return declaration.getModuleSpecifier();
}

/**
 * The name a specifier binds locally: the alias when it renames, and the name
 * itself otherwise. `import { a as b }` binds `b`, which is what the `typescript`
 * package called the specifier's name and ts-morph calls its alias.
 */
function getSpecifierLocalName(specifier: ExportSpecifier | ImportSpecifier): Node {
  return specifier.getAliasNode() ?? specifier.getNameNode();
}

/** What the `as` of a renaming import or export, or of an `as` expression, stands for. */
function getAdjustedLocationForAsKeyword(parent: Node): Node | undefined {
  if (Node.isExportSpecifier(parent) || Node.isImportSpecifier(parent))
    return parent.getAliasNode();
  if (Node.isNamespaceExport(parent) || Node.isNamespaceImport(parent))
    return parent.getNameNode();
  if (Node.isExportDeclaration(parent))
    return parent.getNamespaceExport()?.getNameNode();
  return Node.isAsExpression(parent) ? getTypeReferenceName(parent.getTypeNode()) : undefined;
}

/** The type `keyof` reads the keys of, or the element type `readonly` applies to. */
function getAdjustedLocationForTypeOperator(token: Node, parent: Node): Node | undefined {
  if (!Node.isTypeOperatorTypeNode(parent) || parent.getOperator() !== token.getKind())
    return undefined;
  const operand = parent.getTypeNode();
  if (token.getKind() === SyntaxKind.KeyOfKeyword)
    return getTypeReferenceName(operand);
  return Node.isArrayTypeNode(operand) ? getTypeReferenceName(operand.getElementTypeNode()) : undefined;
}

/** The one type a heritage clause names, or the type a type parameter or conditional type is constrained by. */
function getAdjustedLocationForExtendsOrImplements(token: Node, parent: Node): Node | undefined {
  if (Node.isHeritageClause(parent) && parent.getToken() === token.getKind()) {
    const types = parent.getTypeNodes();
    // more than one type named is ambiguous, so nothing is adjusted to
    if (types.length === 1)
      return types[0].getExpression();
    return undefined;
  }
  if (token.getKind() !== SyntaxKind.ExtendsKeyword)
    return undefined;
  if (Node.isTypeParameterDeclaration(parent))
    return getTypeReferenceName(parent.getConstraint());
  return Node.isConditionalTypeNode(parent) ? getTypeReferenceName(parent.getExtendsType()) : undefined;
}

/** What `in` stands for: a mapped type's parameter, or the thing on its right. */
function getAdjustedLocationForInKeyword(token: Node, parent: Node): Node | undefined {
  if (Node.isTypeParameterDeclaration(parent) && Node.isMappedTypeNode(parent.getParent()))
    return parent.getNameNode();
  if (isOperatorOfBinaryExpression(token, parent))
    return skipOuterExpressions(parent.getRight());
  return Node.isForInStatement(parent) ? skipOuterExpressions(parent.getExpression()) : undefined;
}

function isOperatorOfBinaryExpression(token: Node, parent: Node): parent is BinaryExpression {
  return Node.isBinaryExpression(parent) && parent.getOperatorToken().compilerNode === token.compilerNode;
}

function getTypeReferenceName(typeNode: Node | undefined): Node | undefined {
  return Node.isTypeReference(typeNode) ? typeNode.getTypeName() : undefined;
}

/** Looks through the expressions that only wrap another one — parentheses, assertions, `!`. */
function skipOuterExpressions(node: Node | undefined): Node | undefined {
  let current = node;
  while (
    Node.isAsExpression(current) || Node.isNonNullExpression(current) || Node.isParenthesizedExpression(current)
    || Node.isPartiallyEmittedExpression(current) || Node.isSatisfiesExpression(current) || Node.isTypeAssertion(current)
  ) {
    current = current.getExpression();
  }
  return current;
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

/** The parts of the format settings tsgo's formatter reads. */
function toFormattingOptions(filled: FormatCodeSettings): ts.FormattingOptions {
  return {
    tabSize: filled.tabSize,
    indentSize: filled.indentSize,
    insertSpaces: filled.convertTabsToSpaces,
    indentStyle: filled.indentStyle,
    newLineCharacter: filled.newLineCharacter,
    trimTrailingWhitespace: filled.trimTrailingWhitespace,
  };
}

/**
 * The formatter's edits, rewritten so that no space is left just inside a brace.
 *
 * Every pair of neighbouring tokens where the first is `{` or the second is `}`
 * has the space between them closed up, and whatever the formatter meant to do in
 * that space is dropped. A pair is left alone when there is a comment or a line
 * break between the two tokens, or when the formatter is breaking the line there,
 * because none of those is a space this setting is about.
 */
function closeUpSpacesInsideBraces(
  sourceFile: SourceFile,
  edits: readonly ts.TextEdit[],
  range: [number, number] | undefined,
): readonly ts.TextEdit[] {
  const text = sourceFile.getFullText();
  // the gaps come out in source order, so the edits are read with a cursor that
  // only moves forward rather than scanned again for each one
  const sorted = [...edits].sort(byPosition);
  const kept = new Set(edits);
  const added: ts.TextEdit[] = [];
  let cursor = 0;
  for (const gap of getSpacesInsideBraces(sourceFile)) {
    while (cursor < sorted.length && sorted[cursor].end < gap.pos)
      cursor++;
    let last = cursor;
    while (last < sorted.length && sorted[last].pos <= gap.end)
      last++;
    const overlapping = sorted.slice(cursor, last);
    if (range != null && (gap.pos < range[0] || gap.end > range[1]))
      continue;
    if (!/^[ \t]*$/.test(text.substring(gap.pos, gap.end)))
      continue;
    // the formatter is doing more there than spacing two tokens apart, so it wins
    if (overlapping.some(edit => edit.pos < gap.pos || edit.end > gap.end || /[\r\n]/.test(edit.newText)))
      continue;
    for (const edit of overlapping)
      kept.delete(edit);
    if (gap.end > gap.pos)
      added.push({ pos: gap.pos, end: gap.end, newText: "" });
  }
  if (added.length === 0 && kept.size === edits.length)
    return edits;
  return [...kept, ...added].sort(byPosition);
}

function byPosition(a: ts.TextEdit, b: ts.TextEdit): number {
  return a.pos - b.pos || a.end - b.end;
}

/** Where a space would sit just inside a brace, whether or not one is written there. */
function* getSpacesInsideBraces(sourceFile: SourceFile): Generator<{ pos: number; end: number }> {
  let previous: Node | undefined;
  for (const token of getTokensInOrder(sourceFile)) {
    if (previous != null && isSpaceInsideBraces(previous, token))
      yield { pos: previous.getEnd(), end: token.getStart() };
    previous = token;
  }
}

function isSpaceInsideBraces(previous: Node, token: Node): boolean {
  if (previous.getKind() === SyntaxKind.OpenBraceToken)
    return true;
  if (token.getKind() !== SyntaxKind.CloseBraceToken)
    return false;
  // a `}` that closed a code block is followed by a space whatever this setting
  // says — `class C {m() {} }` — so that pair belongs to the formatter
  return !isCloseBraceOfCodeBlock(previous);
}

/**
 * Whether a token is the `}` of something with statements in it rather than of a
 * literal, which is the `typescript` package's `isAfterCodeBlockContext`. The body
 * of an arrow or function expression is left out of it, since it reads as an
 * argument or a value rather than as a block.
 */
function isCloseBraceOfCodeBlock(token: Node): boolean {
  if (token.getKind() !== SyntaxKind.CloseBraceToken)
    return false;
  const parent = token.getParent();
  switch (parent?.getKind()) {
    case SyntaxKind.CatchClause:
    case SyntaxKind.ClassDeclaration:
    case SyntaxKind.EnumDeclaration:
    case SyntaxKind.ModuleBlock:
    case SyntaxKind.ModuleDeclaration:
    case SyntaxKind.SwitchStatement:
      return true;
    case SyntaxKind.Block: {
      const blockParent = parent!.getParent();
      return blockParent == null
        || blockParent.getKind() !== SyntaxKind.ArrowFunction && blockParent.getKind() !== SyntaxKind.FunctionExpression;
    }
    default:
      return false;
  }
}

/**
 * Every token of a node's code, in source order.
 *
 * jsdoc is skipped whole. A `{@link}` or a `{number}` type expression inside one
 * is parsed into real brace tokens, and rewriting the space around those would be
 * editing a comment.
 */
function* getTokensInOrder(node: Node): Generator<Node> {
  const children = node.getChildren();
  if (children.length === 0) {
    // an empty syntax list occupies no text and so sits between no two tokens
    if (node.getEnd() > node.getStart())
      yield node;
    return;
  }
  for (const child of children) {
    if (child.getKind() !== SyntaxKind.JSDoc)
      yield* getTokensInOrder(child);
  }
}

/** A definition's span covers either the declaration or the name that declares it; this is always the declaration. */
function getDeclarationOfSpanNode(node: Node | undefined): Node | undefined {
  if (node == null)
    return undefined;
  return isNameOfParent(node) ? node.getParent()! : node;
}

/**
 * Whether `node` is the identifier that names a function-like declaration, which
 * is where the `typescript` package answered with the signatures of what is
 * declared rather than with every declaration.
 */
function isNameOfFunctionLikeDeclaration(node: Node | undefined): boolean {
  return node != null && node.getKind() === SyntaxKind.Identifier && isFunctionLike(node.getParent()) && isNameOfParent(node);
}

/** The kinds the `typescript` package's `isFunctionLike` covers, minus the JSDoc ones it produced no wrapper for. */
function isFunctionLike(node: Node | undefined): boolean {
  switch (node?.getKind()) {
    case SyntaxKind.ArrowFunction:
    case SyntaxKind.CallSignature:
    case SyntaxKind.Constructor:
    case SyntaxKind.ConstructorType:
    case SyntaxKind.ConstructSignature:
    case SyntaxKind.FunctionDeclaration:
    case SyntaxKind.FunctionExpression:
    case SyntaxKind.FunctionType:
    case SyntaxKind.GetAccessor:
    case SyntaxKind.IndexSignature:
    case SyntaxKind.MethodDeclaration:
    case SyntaxKind.MethodSignature:
    case SyntaxKind.SetAccessor:
      return true;
    default:
      return false;
  }
}

/**
 * The span of the name `node` declares, or `undefined` when the node is not a
 * declaration with a name.
 */
function getDeclarationNameSpan(node: Node | undefined): { pos: number; end: number } | undefined {
  if (node == null || !Node.hasName(node))
    return undefined;
  const nameNode = node.getNameNode();
  return { pos: nameNode.getStart(), end: nameNode.getEnd() };
}

/**
 * The name of what a definition is declared in — the class a method belongs to,
 * the namespace a namespaced declaration belongs to, and so on.
 */
function getDefinitionContainerName(node: Node | undefined, askingNode: Node | undefined): string {
  const container = getDeclarationContainer(node);
  if (Node.isClassDeclaration(container) || Node.isClassExpression(container))
    return container.getName() ?? getUnnamedClassName(container);
  // the `typescript` package qualified an interface or enum container with the
  // namespaces around it, but not a class container
  if (Node.isInterfaceDeclaration(container) || Node.isEnumDeclaration(container))
    return qualifyByNamespaces(getNamespacePrefix(container), container.getName(), askingNode);
  if (Node.isModuleDeclaration(container))
    return qualifyByNamespaces(getNamespacePrefix(container), getModuleName(container), askingNode);
  if (Node.isObjectLiteralExpression(container) || Node.isTypeLiteral(container))
    return getLiteralContainerName(container);
  return "";
}

/**
 * The declaration a definition is a member of, reached by looking through the
 * nodes that only group members together.
 */
function getDeclarationContainer(node: Node | undefined): Node | undefined {
  const declaration = getDeclarationOfSpanNode(node);
  if (declaration == null)
    return undefined;
  let container = declaration.getParent();
  // a constructor parameter written with a modifier declares a property of the class
  if (Node.isConstructorDeclaration(container) && Node.isParameterDeclaration(declaration) && declaration.isParameterProperty())
    container = container.getParent();
  while (container != null && isMemberGrouping(container))
    container = container.getParent();
  return container;
}

function isNameOfParent(node: Node): boolean {
  const parent = node.getParent();
  if (parent == null || !Node.hasName(parent))
    return false;
  const nameNode = parent.getNameNode() as Node | undefined;
  return nameNode?.compilerNode === node.compilerNode;
}

function isMemberGrouping(node: Node): boolean {
  switch (node.getKind()) {
    case SyntaxKind.ModuleBlock:
    case SyntaxKind.VariableDeclarationList:
    case SyntaxKind.VariableStatement:
      return true;
    default:
      return false;
  }
}

/**
 * A container's name, qualified by the namespaces around it only as far as the
 * position asking needs.
 *
 * The `typescript` package named a namespace from the first segment that is not
 * already in scope where the question was asked, so `Outer.Inner.iv` read
 * `Outer.Inner` from the file's top level and `Inner` from inside `Outer`. The
 * segments are compared by name because namespaces merge across declarations and
 * across files.
 */
function qualifyByNamespaces(namespaces: string[], name: string, askingNode: Node | undefined): string {
  const inScope = getEnclosingNamespaces(askingNode);
  let skipped = 0;
  while (skipped < namespaces.length && namespaces[skipped] === inScope[skipped])
    skipped++;
  return [...namespaces.slice(skipped), name].join(".");
}

/**
 * The namespaces a declaration is written in, outermost first. An ambient module
 * and `declare global` end the chain rather than join it, which is how the
 * `typescript` package qualified what they hold.
 */
function getNamespacePrefix(node: Node): string[] {
  const container = getDeclarationContainer(node);
  if (!Node.isModuleDeclaration(container) || endsNamespaceChain(container))
    return [];
  return [...getNamespacePrefix(container), getModuleName(container)];
}

/** The namespaces a position is written inside, outermost first, on the same terms. */
function getEnclosingNamespaces(node: Node | undefined): string[] {
  const namespaces: string[] = [];
  for (let current = node; current != null; current = current.getParent()) {
    if (!Node.isModuleDeclaration(current))
      continue;
    if (endsNamespaceChain(current))
      break;
    namespaces.unshift(getModuleName(current));
  }
  return namespaces;
}

function endsNamespaceChain(node: ModuleDeclaration): boolean {
  return node.getDeclarationKind() === ModuleDeclarationKind.Global || Node.isStringLiteral(node.getNameNode());
}

function getModuleName(node: ModuleDeclaration): string {
  const nameNode = node.getNameNode();
  // the `typescript` package always wrote an ambient module's name double quoted
  return Node.isStringLiteral(nameNode) ? `"${nameNode.getLiteralValue()}"` : nameNode.getText();
}

/**
 * What the `typescript` package called an object or type literal's container: the
 * variable it is written in, or the literal's own symbol name when it is written
 * anywhere else.
 */
function getLiteralContainerName(container: Node): string {
  const parent = container.getParent();
  if (Node.isVariableDeclaration(parent))
    return parent.getName();
  return Node.isObjectLiteralExpression(container) ? "__object" : "__type";
}

/** What the binder called a class with no name of its own. */
function getUnnamedClassName(container: ClassDeclaration | ClassExpression): string {
  const parent = container.getParent();
  if (Node.isVariableDeclaration(parent))
    return parent.getName();
  return Node.isClassDeclaration(container) && container.isDefaultExport() ? "default" : "";
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
 * What kind of element a symbol declares.
 *
 * tsgo does not classify definitions, so this is derived from the symbol the way
 * `getSymbolKind` in the `typescript` package derived it. What a symbol is as a
 * value — a variable, function, accessor, method, constructor or property — is
 * decided first, and only a symbol that is none of those reads as a class, enum,
 * type, interface, alias or namespace. That order is what a merged declaration
 * turns on: a function merged with a namespace is a `function`, and a namespace
 * reads `module` only when it is nothing else. See `ts.ScriptElementKind` for the
 * members that survived; a kind that has no member here keeps the kind it is a
 * special case of, so `using` reads `var` and a function-local variable reads
 * `var` rather than `local var`.
 */
function getScriptElementKind(symbol: ts.Symbol | undefined): ts.ScriptElementKind {
  if (symbol == null)
    return ts.ScriptElementKind.unknown;
  const flags = symbol.flags;
  if (flags & SymbolFlags.Variable)
    return getVariableScriptElementKind(symbol);
  if (flags & SymbolFlags.Function)
    return ts.ScriptElementKind.functionElement;
  if (flags & SymbolFlags.GetAccessor)
    return ts.ScriptElementKind.memberGetAccessorElement;
  if (flags & SymbolFlags.SetAccessor)
    return ts.ScriptElementKind.memberSetAccessorElement;
  if (flags & SymbolFlags.Method)
    return ts.ScriptElementKind.memberFunctionElement;
  if (flags & SymbolFlags.Constructor)
    return ts.ScriptElementKind.constructorImplementationElement;
  if (flags & SymbolFlags.Property)
    return ts.ScriptElementKind.memberVariableElement;
  if (flags & SymbolFlags.Class)
    return ts.ScriptElementKind.class;
  if (flags & SymbolFlags.RegularEnum || flags & SymbolFlags.ConstEnum)
    return ts.ScriptElementKind.enumElement;
  if (flags & SymbolFlags.TypeAlias)
    return ts.ScriptElementKind.typeElement;
  if (flags & SymbolFlags.Interface)
    return ts.ScriptElementKind.interfaceElement;
  if (flags & SymbolFlags.TypeParameter)
    return ts.ScriptElementKind.typeParameterElement;
  if (flags & SymbolFlags.EnumMember)
    return ts.ScriptElementKind.enumMemberElement;
  if (flags & SymbolFlags.Alias)
    return ts.ScriptElementKind.alias;
  if (flags & SymbolFlags.Module)
    return ts.ScriptElementKind.moduleElement;
  return ts.ScriptElementKind.unknown;
}

/**
 * Whether a variable reads as a parameter, a `const`, a `let` or a `var`.
 *
 * The symbol cannot say: its flags only separate block scope from function scope,
 * which puts a parameter and a `var` together and says nothing about the keyword.
 * Both distinctions are written on the declaration, so this asks it — the same
 * `isFirstDeclarationOfSymbolParameter`, `isVarConst` and `isLet` the `typescript`
 * package asked.
 */
function getVariableScriptElementKind(symbol: ts.Symbol): ts.ScriptElementKind {
  if (isFirstDeclarationOfSymbolParameter(symbol))
    return ts.ScriptElementKind.parameterElement;
  if (getBlockScope(symbol.valueDeclaration) === ts.NodeFlags.Const)
    return ts.ScriptElementKind.constElement;
  if (symbol.declarations.some(declaration => getBlockScope(declaration) === ts.NodeFlags.Let))
    return ts.ScriptElementKind.letElement;
  return ts.ScriptElementKind.variableElement;
}

/** Whether a symbol is first declared as a parameter, counting a name destructured out of one. */
function isFirstDeclarationOfSymbolParameter(symbol: ts.Symbol): boolean {
  const declaration = symbol.declarations[0];
  if (declaration == null)
    return false;
  // a handle knows its own kind without being resolved, so only a destructured
  // name — which is a binding element wherever it is written — costs a lookup
  if (declaration.kind !== SyntaxKind.BindingElement)
    return declaration.kind === SyntaxKind.Parameter;
  for (let node = declaration.resolve()?.parent; node != null; node = node.parent) {
    if (node.kind === SyntaxKind.Parameter)
      return true;
    if (!isBindingElementOrPattern(node.kind))
      return false;
  }
  return false;
}

/**
 * Which of `let`, `const`, `using` and `await using` a declaration is written
 * with, as `ts.NodeFlags`, or `None` for a `var` and for anything that is not a
 * variable at all.
 *
 * The keyword belongs to the declaration list rather than to the name it
 * declares, and a destructured name is further down inside a binding pattern, so
 * the flags are collected on the way up — what `getCombinedNodeFlags` did.
 */
function getBlockScope(declaration: ts.NodeHandle | undefined): ts.NodeFlags {
  let node = declaration?.resolve();
  while (node != null && isBindingElementOrPattern(node.kind))
    node = node.parent;
  if (node == null)
    return ts.NodeFlags.None;
  let flags = node.flags;
  if (node.kind === SyntaxKind.VariableDeclaration)
    node = node.parent;
  if (node?.kind === SyntaxKind.VariableDeclarationList) {
    flags |= node.flags;
    node = node.parent;
  }
  if (node?.kind === SyntaxKind.VariableStatement)
    flags |= node.flags;
  return flags & ts.NodeFlags.BlockScoped;
}

function isBindingElementOrPattern(kind: SyntaxKind): boolean {
  return kind === SyntaxKind.BindingElement || kind === SyntaxKind.ObjectBindingPattern || kind === SyntaxKind.ArrayBindingPattern;
}
