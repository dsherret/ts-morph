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
   * @remarks This names the file the printed text is read back under, so it only
   * matters when a source file is supplied for the node's comments and original
   * token text. tsgo prints by node kind, so it no longer decides whether, say,
   * `<T>x` prints as a type assertion or as JSX.
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
 * @remarks The node is printed on its own, without the comments and original
 * token text that only the file it was parsed from can supply. Use the overload
 * that accepts a source file to print those too.
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
  const sourceFile = isFirstOverload ? undefined : sourceFileOrOptions as ts.SourceFile;

  return ts.printNode(node, {
    sourceText: sourceFile?.text,
    fileName: sourceFile?.fileName ?? printFileName(options.scriptKind),
    removeComments: options.removeComments,
    newLine: options.newLineKind,
    preserveSourceNewlines: options.preserveSourceNewlines,
    neverAsciiEscape: options.neverAsciiEscape,
    terminateUnterminatedLiterals: options.terminateUnterminatedLiterals,
  });
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
