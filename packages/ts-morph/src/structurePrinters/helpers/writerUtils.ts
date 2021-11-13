import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { CharCodes } from "../../utils";

export function isLastNonWhitespaceCharCloseBrace(writer: CodeBlockWriter) {
  return writer.iterateLastCharCodes(charCode => {
    if (charCode === CharCodes.CLOSE_BRACE)
      return true;
    else if (StringUtils.isWhitespaceCharCode(charCode))
      return undefined;
    else
      return false;
  }) || false;
}
