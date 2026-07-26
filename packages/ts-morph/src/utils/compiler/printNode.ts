import { NewLineKind } from "@ts-morph/common";

/**
 * Options for printing a node.
 *
 * Breaking change: `removeComments`, `emitHint` and `scriptKind` are gone, and
 * the tsgo printer's own options take their place. tsgo prints on the server, and
 * the node is sent there with the text of the file it was parsed from, so there
 * is no printer object to configure and no synthetic source file to give a script
 * kind to. `newLineKind` is applied by ts-morph to the printed text rather than by
 * the printer.
 *
 * The free `printNode` function is gone with them: printing needs the compiler
 * session the node came from, so it is only reachable as `Node#print()`.
 */
export interface PrintNodeOptions {
  /**
   * New line kind.
   *
   * Defaults to the manipulation settings' new line kind.
   */
  newLineKind?: NewLineKind;
  /** Whether to keep the line breaks the node's source text has. */
  preserveSourceNewlines?: boolean;
  /** Whether to leave non-ASCII characters unescaped. */
  neverAsciiEscape?: boolean;
  /** Whether to close a literal that the source leaves unterminated. */
  terminateUnterminatedLiterals?: boolean;
}
