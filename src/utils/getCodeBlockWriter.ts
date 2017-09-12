import CodeBlockWriter from "code-block-writer";
import {IndentationText, ManipulationSettingsContainer} from "./../ManipulationSettings";

export function getCodeBlockWriter(manipulationSettings: ManipulationSettingsContainer) {
    const indentationText = manipulationSettings.getIndentationText();
    return new CodeBlockWriter({
        newLine: manipulationSettings.getNewLineKind(),
        indentNumberOfSpaces: indentationText === IndentationText.Tab ? undefined : indentationText.length,
        useTabs: indentationText === IndentationText.Tab
    });
}
