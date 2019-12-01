import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";

export function isLastNonWhitespaceCharCloseBrace(writer: CodeBlockWriter) {
    const closeBraceCharCode = "}".charCodeAt(0);
    return writer.iterateLastCharCodes(charCode => {
        if (charCode === closeBraceCharCode)
            return true;
        else if (StringUtils.isWhitespaceCharCode(charCode))
            return undefined;
        else
            return false;
    }) || false;
}
