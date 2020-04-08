import { ts } from "@ts-morph/common";
import { SourceFile, TextChange } from "../../compiler";

export function getTextFromTextChanges(sourceFile: SourceFile, textChanges: ReadonlyArray<TextChange | ts.TextChange>) {
    const text = sourceFile.getFullText();
    const editResult: string[] = []; // it's faster to build up the string in an array
    let start = 0;

    for (const { edit } of getSortedTextChanges()) {
        const span = edit.getSpan();
        const beforeEdit = text.slice(start, span.getStart());
        start = span.getEnd();
        editResult.push(beforeEdit);
        editResult.push(edit.getNewText());
    }

    editResult.push(text.slice(start));
    return editResult.join("");

    function getSortedTextChanges() {
        // ensure the array is sorted
        return textChanges.map((edit, index) => ({ edit: toWrappedTextChange(edit), index })).sort((a, b) => {
            const aStart = a.edit.getSpan().getStart();
            const bStart = b.edit.getSpan().getStart();
            const difference = aStart - bStart;
            if (difference === 0)
                return a.index < b.index ? -1 : 1;
            return difference < 0 ? -1 : 1;
        });
    }

    function toWrappedTextChange(change: TextChange | ts.TextChange) {
        if (change instanceof TextChange)
            return change;
        else
            return new TextChange(change);
    }
}
