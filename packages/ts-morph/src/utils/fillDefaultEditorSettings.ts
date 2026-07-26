import { EditorSettings, ts } from "@ts-morph/common";
import { IndentationText, ManipulationSettingsContainer } from "../options";
import { setValueIfUndefined } from "./setValueIfUndefined";

/** Fills in the formatting options tsgo's formatter reads, from the manipulation settings. */
export function fillDefaultEditorSettings(settings: EditorSettings, manipulationSettings: ManipulationSettingsContainer) {
  setValueIfUndefined(settings, "convertTabsToSpaces", manipulationSettings.getIndentationText() !== IndentationText.Tab);
  setValueIfUndefined(settings, "newLineCharacter", manipulationSettings.getNewLineKindAsString());
  setValueIfUndefined(settings, "indentStyle", ts.IndentStyle.Smart);
  setValueIfUndefined(settings, "indentSize", manipulationSettings.getIndentationText().length);
  setValueIfUndefined(settings, "tabSize", manipulationSettings.getIndentationText().length);
}
