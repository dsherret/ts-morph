import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../codeBlockWriter";
import { isValidVariableName } from "./namingValidator";

/** Utilities for code block writer. */
export class WriterUtils {
  private constructor() {
  }

  /** Gets the last characters to the specified position as a string. */
  static getLastCharactersToPos(writer: CodeBlockWriter, pos: number) {
    const writerLength = writer.getLength();
    const charCount = writerLength - pos;
    const chars: string[] = new Array(charCount);
    writer.iterateLastChars((char, i) => {
      const insertPos = i - pos;
      if (insertPos < 0)
        return true; // exit iterating
      chars[insertPos] = char;
      return undefined;
    });
    return chars.join("");
  }

  /* Adds quotes if structure is not a valid variable name
   * AND the string is not enclosed in quotation marks */
  static writePropertyName(writer: CodeBlockWriter, text: string) {
    if (isValidVariableName(text) || StringUtils.isQuoted(text))
      writer.write(text);
    else
      writer.quote(text);
  }
}
