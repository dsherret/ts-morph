import { CodeBlockWriter } from "../../codeBlockWriter";
import { StringUtils } from "../../utils";

export function isLastNonWhitespaceCharCloseBrace(writer: CodeBlockWriter) {
    return writer.iterateLastChars(char => {
        if (char === "}")
            return true;
        else if (StringUtils.isWhitespaceChar(char))
            return undefined;
        else
            return false;
    }) || false;
}
