import { errors, getStoredNode, SymbolFlags, SyntaxKind, ts } from "@ts-morph/common";
import { getTextFromTextChanges } from "../../manipulation";
import { ProjectContext } from "../../ProjectContext";
import { fillDefaultFormatCodeSettings } from "../../utils";
import { ClassDeclaration, ClassExpression } from "../ast/class";
import { Node } from "../ast/common";
import { QuoteKind } from "../ast/literal";
import { ModuleDeclaration, ModuleDeclarationKind, SourceFile } from "../ast/module";
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
    // tsgo resolves references from a node rather than from a bare position, and
    // the node under a position is often a rebuilt one — punctuation, a keyword,
    // a syntax list — which the compiler has no handle for. References are a
    // question about a position, so ask about the node that encloses it.
    const node = sourceFile.getDescendantAtPos(pos);
    if (node == null)
      return [];
    const location = getStoredNode(node.compilerNode);
    if (location == null)
      return [];
    const entries = this.#context.compilerFactory.documentRegistry.checker.getReferencedSymbolsForNode(location, pos);
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
    const result = this.compilerObject.getCombinedCodeFix(fileName, fixId, this.#getFilledSettings(formatSettings), this.#getQuotePreference());
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
    return {
      ...toDocumentSpan({ ...span, ...nameSpan }),
      kind: getScriptElementKind(this.#context.compilerFactory.documentRegistry.checker.getSymbolAtPosition(span.fileName, span.pos)),
      name,
      containerKind: ts.ScriptElementKind.unknown,
      containerName: getDefinitionContainerName(node, askingNode),
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
      references: entry.references.map((handle, i) => {
        const node = handle.resolve();
        return {
          ...toNodeSpan(handle.path, node),
          isWriteAccess: entry.writeAccess[i] ?? false,
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
