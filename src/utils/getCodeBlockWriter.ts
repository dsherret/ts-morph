import CodeBlockWriter from "code-block-writer";
import {IndentationText, ManipulationSettingsContainer} from "./../ManipulationSettings";

export function getTextFromStringOrWriter(manipulationSettings: ManipulationSettingsContainer, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    if (typeof textOrWriterFunction === "string")
        return textOrWriterFunction;

    const writer = getCodeBlockWriter(manipulationSettings);
    textOrWriterFunction(writer);
    return writer.toString();
}

export function getCodeBlockWriter(manipulationSettings: ManipulationSettingsContainer) {
    const indentationText = manipulationSettings.getIndentationText();
    return new CodeBlockWriter({
        newLine: manipulationSettings.getNewLineKind(),
        indentNumberOfSpaces: indentationText === IndentationText.Tab ? undefined : indentationText.length,
        useTabs: indentationText === IndentationText.Tab
    });
}
