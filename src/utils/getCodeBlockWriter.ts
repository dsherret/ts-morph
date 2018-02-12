import CodeBlockWriter from "code-block-writer";
import {QuoteType} from "./../compiler";
import {IndentationText, ManipulationSettingsContainer} from "./../ManipulationSettings";

// todo: remove this function
export function getTextFromStringOrWriter(manipulationSettings: ManipulationSettingsContainer, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    if (typeof textOrWriterFunction === "string")
        return textOrWriterFunction;

    const writer = getCodeBlockWriter(manipulationSettings);
    textOrWriterFunction(writer);
    return writer.toString();
}

// todo: remove this function
export function getCodeBlockWriter(manipulationSettings: ManipulationSettingsContainer) {
    const indentationText = manipulationSettings.getIndentationText();
    return new CodeBlockWriter({
        newLine: manipulationSettings.getNewLineKindAsString(),
        indentNumberOfSpaces: indentationText === IndentationText.Tab ? undefined : indentationText.length,
        useTabs: indentationText === IndentationText.Tab,
        useSingleQuote: manipulationSettings.getQuoteType() === QuoteType.Single
    });
}
