import { NewLineKind, ScriptKind, SyntaxKind, ts } from "@ts-morph/common";

/**
 * Options for printing a node.
 *
 * Breaking change: `emitHint` is gone. tsgo's printer has no hint parameter — it
 * dispatches on the node's kind — so there is nothing to pass one to.
 */
export interface PrintNodeOptions {
  /** Whether to remove comments or not. */
  removeComments?: boolean;
  /**
   * New line kind.
   *
   * Defaults to the manipulation settings' new line kind for `Node#print()`, and
   * to line feed for the standalone `printNode`.
   */
  newLineKind?: NewLineKind;
  /**
   * The script kind.
   *
   * @remarks This names the file the node's source text is read back under. tsgo
   * prints by node kind, so it no longer decides whether, say, `<T>x` prints as a
   * type assertion or as JSX.
   *
   * It has nothing to say when a source file is supplied, because that file names
   * itself; without one it overrides the name of the file the node was parsed from.
   *
   * Defaults to TSX.
   */
  scriptKind?: ScriptKind;
  /** Whether to keep the line breaks the node's source text has. */
  preserveSourceNewlines?: boolean;
  /** Whether to leave non-ASCII characters unescaped. */
  neverAsciiEscape?: boolean;
  /** Whether to close a literal that the source leaves unterminated. */
  terminateUnterminatedLiterals?: boolean;
}

/**
 * Prints the provided node using the compiler's printer.
 * @param node - Compiler node.
 * @param options - Options.
 * @remarks A node that was parsed is printed against the file it came from, so it
 * keeps its comments and original token text. A node built with the compiler API
 * factory methods has no such file and is printed on its own.
 */
export function printNode(node: ts.Node, options?: PrintNodeOptions): string;
/**
 * Prints the provided node using the compiler's printer.
 * @param node - Compiler node.
 * @param sourceFile - Compiler source file.
 * @param options - Options.
 */
export function printNode(node: ts.Node, sourceFile: ts.SourceFile, options?: PrintNodeOptions): string;
export function printNode(node: ts.Node, sourceFileOrOptions?: PrintNodeOptions | ts.SourceFile, secondOverloadOptions?: PrintNodeOptions) {
  const isFirstOverload = sourceFileOrOptions == null || (sourceFileOrOptions as ts.SourceFile).kind !== SyntaxKind.SourceFile;
  const options = (isFirstOverload ? sourceFileOrOptions as PrintNodeOptions : secondOverloadOptions) ?? {};
  const givenSourceFile = isFirstOverload ? undefined : sourceFileOrOptions as ts.SourceFile;
  // a caller who names no file gets the one the node was parsed from, which is
  // what supplies its comments and original token text
  const sourceFile = givenSourceFile ?? getParsedSourceFile(node);

  return ts.printNode(node, {
    sourceText: sourceFile?.text,
    fileName: fileName(),
    removeComments: options.removeComments,
    newLine: options.newLineKind,
    preserveSourceNewlines: options.preserveSourceNewlines,
    neverAsciiEscape: options.neverAsciiEscape,
    terminateUnterminatedLiterals: options.terminateUnterminatedLiterals,
  });

  /**
   * The name the source text is read back under. A file the caller supplied names
   * itself, and otherwise an explicit script kind decides — it would have nothing
   * left to say if the file the node happens to come from spoke for it.
   */
  function fileName() {
    if (givenSourceFile != null)
      return givenSourceFile.fileName;
    if (options.scriptKind == null && sourceFile != null)
      return sourceFile.fileName;
    return printFileName(options.scriptKind);
  }
}

/** The file a node was parsed from, or `undefined` for one the factory built. */
function getParsedSourceFile(node: ts.Node): ts.SourceFile | undefined {
  // a factory node has no parent to walk up to, so this answers with the node
  // itself — which is a source file only when the node is one
  const sourceFile = node.getSourceFile() as ts.SourceFile | undefined;
  return sourceFile?.kind === SyntaxKind.SourceFile ? sourceFile : undefined;
}

/** Names the file a supplied source text is read back under. */
function printFileName(scriptKind: ScriptKind | undefined) {
  switch (scriptKind) {
    case ScriptKind.JS:
      return "/print.js";
    case ScriptKind.JSX:
      return "/print.jsx";
    case ScriptKind.TS:
      return "/print.ts";
    case ScriptKind.JSON:
      return "/print.json";
    default:
      return "/print.tsx";
  }
}
