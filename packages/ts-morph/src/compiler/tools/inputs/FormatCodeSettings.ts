import { ts } from "@ts-morph/common";

/**
 * Format settings accepted by ts-morph's formatting operations.
 *
 * The members inherited from `ts.FormatCodeSettings` are what tsgo's formatter
 * reads; the members declared here are applied by ts-morph itself, either to the
 * formatter's output or by its own structure printers.
 */
export interface FormatCodeSettings extends ts.FormatCodeSettings {
  /** Whether to ensure the file ends with a newline. Applied after formatting. */
  ensureNewLineAtEndOfFile?: boolean;
  /**
   * Whether to insert a space after opening and before closing non-empty braces.
   *
   * ex. `import { Item } from "./Item";` or `import {Item} from "./Item";`
   */
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
}
