import { SourceFile, TextChange } from "../../compiler";

export function getTextFromFormattingEdits(sourceFile: SourceFile, formattingEdits: TextChange[]) {
    // reverse the order
    formattingEdits = [...formattingEdits].sort((a, b) => b.getSpan().getStart() - a.getSpan().getStart());
    let text = sourceFile.getFullText();

    for (const textChange of formattingEdits) {
        const span = textChange.getSpan();
        text = text.slice(0, span.getStart()) + textChange.getNewText() + text.slice(span.getEnd());
    }

    return text;
}
