import { FormatCodeSettings } from "../compiler";
import { ManipulationSettingsContainer } from "../options";
import { fillDefaultEditorSettings } from "./fillDefaultEditorSettings";
import { setValueIfUndefined } from "./setValueIfUndefined";

/**
 * Fills in the format settings the compiler understands.
 *
 * Only two are worth defaulting. The compiler's formatter accepts tab size,
 * spaces-versus-tabs and trailing whitespace trimming and nothing else, so a
 * default for any of the `insertSpace…` or `placeOpenBraceOnNewLine…` options
 * would have nothing to act on.
 *
 * `ensureNewLineAtEndOfFile` and `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces`
 * are the exceptions: ts-morph implements both itself, in its structure printers
 * and by post-processing the formatter's edits.
 */
export function fillDefaultFormatCodeSettings(settings: FormatCodeSettings, manipulationSettings: ManipulationSettingsContainer) {
  fillDefaultEditorSettings(settings, manipulationSettings);
  setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", true);
  setValueIfUndefined(settings, "ensureNewLineAtEndOfFile", true);
}
