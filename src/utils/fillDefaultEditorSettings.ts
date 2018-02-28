import {ManipulationSettingsContainer, IndentationText} from "./../ManipulationSettings";
import {ts, IndentStyle, EditorSettings} from "./../typescript";
import {setValueIfUndefined} from "./setValueIfUndefined";

export function fillDefaultEditorSettings(settings: EditorSettings, manipulationSettings: ManipulationSettingsContainer) {
    setValueIfUndefined(settings, "convertTabsToSpaces", manipulationSettings.getIndentationText() !== IndentationText.Tab);
    setValueIfUndefined(settings, "newLineCharacter", manipulationSettings.getNewLineKindAsString());
    setValueIfUndefined(settings, "indentStyle", IndentStyle.Smart);
    setValueIfUndefined(settings, "indentSize", manipulationSettings.getIndentationText().length);
    setValueIfUndefined(settings, "tabSize", manipulationSettings.getIndentationText().length);
}
