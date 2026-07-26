import { FormatCodeSettings } from "../compiler";
import { ManipulationSettingsContainer } from "../options";
import { fillDefaultEditorSettings } from "./fillDefaultEditorSettings";
import { setValueIfUndefined } from "./setValueIfUndefined";

/**
 * Fills in the format settings tsgo understands.
 *
 * Breaking change: most of the `insertSpace…` and `placeOpenBraceOnNewLine…`
 * options are gone. tsgo's formatter accepts only tab size, spaces-versus-tabs
 * and trailing whitespace trimming, so the defaults that used to be set here had
 * no effect to set.
 *
 * `ensureNewLineAtEndOfFile` and `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces`
 * are kept because ts-morph's own structure printers implement them, rather than
 * handing them to the formatter.
 */
export function fillDefaultFormatCodeSettings(settings: FormatCodeSettings, manipulationSettings: ManipulationSettingsContainer) {
  fillDefaultEditorSettings(settings, manipulationSettings);
  setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", true);
  setValueIfUndefined(settings, "ensureNewLineAtEndOfFile", true);
}
