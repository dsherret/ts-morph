import { CodeBlockWriter } from "../codeBlockWriter";

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
}
