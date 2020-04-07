import { ts } from "@ts-morph/common";
import { SourceFile, TextChange } from "../../compiler";

export function getTextFromTextChanges(sourceFile: SourceFile, textChanges: ReadonlyArray<TextChange | ts.TextChange>) {
    // reverse the order
    const reversedFormattingEdits = textChanges.map((edit, index) => ({ edit: toWrappedTextChange(edit), index })).sort((a, b) => {
        const aStart = a.edit.getSpan().getStart();
        const bStart = b.edit.getSpan().getStart();
        const difference = bStart - aStart;
        if (difference === 0)
            return a.index < b.index ? 1 : -1;
        return difference > 0 ? 1 : -1;
    });

    const text = sourceFile.getFullText();
    let start = 0;
    let end = text.length;
    const editResult: Array<string> = [];
    for (const { edit } of reversedFormattingEdits) {
        const span = edit.getSpan();
        start = span.getEnd();
        const afterResult = text.slice(start, end);
        end = span.getStart();
        editResult.push(afterResult);
        editResult.push(edit.getNewText());
    }
    editResult.push(text.slice(0, end));
    return editResult.reverse().join('');

    function toWrappedTextChange(change: TextChange | ts.TextChange) {
        if (change instanceof TextChange)
            return change;
        else
            return new TextChange(change);
    }
}
