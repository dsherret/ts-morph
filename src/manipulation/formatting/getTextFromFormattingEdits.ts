import { SourceFile, TextChange } from "../../compiler";

export function getTextFromFormattingEdits(sourceFile: SourceFile, formattingEdits: ReadonlyArray<TextChange>) {
    formattingEdits = [...formattingEdits].reverse();
    let text = sourceFile.getFullText();

    for (const textChange of formattingEdits) {
        const span = textChange.getSpan();
        text = text.slice(0, span.getStart()) + textChange.getNewText() + text.slice(span.getEnd());
    }

    return text;
}
