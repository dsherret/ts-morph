import { CodeBlockWriter } from "../../codeBlockWriter";
import { StringUtils } from "../../utils";

export function isLastNonWhitespaceCharCloseBrace(writer: CodeBlockWriter) {
    // todo: for performance reasons, need a way to iterate over the past chars
    // of a CodeBlockWriter rather than calling .toString()
    const str = writer.toString();
    for (let i = str.length - 1; i >= 0; i--) {
        const char = str[i];
        if (StringUtils.isWhitespaceChar(char))
            continue;
        return char === "}";
    }

    return false;
}
