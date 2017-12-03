import CodeBlockWriter from "code-block-writer";
import {getTextFromStringOrWriter, StringUtils} from "./../../utils";
import {ManipulationSettingsContainer} from "./../../ManipulationSettings";

export interface GetIndentedTextOptions {
    textOrWriterFunction: string | ((writer: CodeBlockWriter) => void);
    manipulationSettings: ManipulationSettingsContainer;
    indentationText: string;
}

// todo: remove this function
export function getIndentedText(opts: GetIndentedTextOptions) {
    const {textOrWriterFunction, manipulationSettings, indentationText} = opts;
    const newLineKind = manipulationSettings.getNewLineKind();
    const originalText = getTextFromStringOrWriter(manipulationSettings, textOrWriterFunction);
    if (originalText.length > 0)
        return originalText.split(/\r?\n/).map(t => t.length > 0 ? indentationText + t : t).join(newLineKind);
    return originalText;
}
