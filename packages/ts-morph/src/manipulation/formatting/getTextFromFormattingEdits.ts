import { ts } from "@ts-morph/common";
import { SourceFile, TextChange } from "../../compiler";

export function getTextFromTextChanges(sourceFile: SourceFile, textChanges: ReadonlyArray<TextChange | ts.TextChange>) {
    const text = sourceFile.getFullText();
    let start = 0;
    let end = 0;
    const editResult: Array<string> = [];
    for (const textChange of textChanges) {
        const edit = toWrappedTextChange(textChange);
        const span = edit.getSpan();
        end = span.getStart();
        const beforeEdit = text.slice(start, end);
        start = span.getEnd();
        editResult.push(beforeEdit);
        editResult.push(edit.getNewText());
    }
    editResult.push(text.slice(start));
    return editResult.join("");

    function toWrappedTextChange(change: TextChange | ts.TextChange) {
        if (change instanceof TextChange)
            return change;
        else
            return new TextChange(change);
    }
}
