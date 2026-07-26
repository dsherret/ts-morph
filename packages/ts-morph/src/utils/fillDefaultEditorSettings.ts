import { EditorSettings } from "@ts-morph/common";
import { IndentationText, ManipulationSettingsContainer } from "../options";
import { setValueIfUndefined } from "./setValueIfUndefined";

/**
 * Fills in the formatting options tsgo understands.
 *
 * Breaking change: `convertTabsToSpaces` is now `insertSpaces` — tsgo's name for
 * the same thing, with the same polarity, so the value carries over unchanged.
 * `indentStyle`, `indentSize` and `newLineCharacter` are gone: tsgo's formatter
 * has no equivalent, so passing them would have been silently discarded.
 */
export function fillDefaultEditorSettings(settings: EditorSettings, manipulationSettings: ManipulationSettingsContainer) {
  setValueIfUndefined(settings, "insertSpaces", manipulationSettings.getIndentationText() !== IndentationText.Tab);
  setValueIfUndefined(settings, "tabSize", manipulationSettings.getIndentationText().length);
}
