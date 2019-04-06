import { SourceFile, TextChange } from "../../compiler";

export function getTextFromFormattingEdits(sourceFile: SourceFile, formattingEdits: ReadonlyArray<TextChange>) {
    // reverse the order
    formattingEdits = [...formattingEdits].sort((a, b) => {
        const aStart = a.getSpan().getStart();
        const bStart = b.getSpan().getStart();
        const difference = bStart - aStart;
        return difference === 0 ? -1 : difference < 0 ? -1 : 1;
    });
    let text = sourceFile.getFullText();
    for (const textChange of formattingEdits) {
        const span = textChange.getSpan();
        text = text.slice(0, span.getStart()) + textChange.getNewText() + text.slice(span.getEnd());
    }
    return text;
}
