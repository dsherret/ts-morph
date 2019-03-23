import { QuoteKind } from "../compiler";
import * as errors from "../errors";

const isSpaces = /^ +$/;
const isWhitespace = /^\s*$/;
const startsWithNewLine = /^\r?\n/;
const endsWithNewLine = /\r?\n$/;

export class StringUtils {
    private constructor() {
    }

    static hasBom(text: string) {
        return text.charCodeAt(0) === 0xFEFF;
    }

    static stripBom(text: string) {
        if (StringUtils.hasBom(text))
            return text.slice(1);
        return text;
    }

    static isNullOrWhitespace(str: string | undefined): str is undefined {
        return typeof str !== "string" || StringUtils.isWhitespace(str);
    }

    static isNullOrEmpty(str: string | undefined): str is undefined {
        return typeof str !== "string" || str.length === 0;
    }

    static isWhitespace(str: string) {
        return isWhitespace.test(str);
    }

    static startsWithNewLine(str: string) {
        return startsWithNewLine.test(str);
    }

    static endsWithNewLine(str: string) {
        return endsWithNewLine.test(str);
    }

    static insertAtLastNonWhitespace(str: string, insertText: string) {
        let i = str.length;
        while (i > 0 && isWhitespace.test(str[i - 1]))
            i--;
        return str.substring(0, i) + insertText + str.substring(i);
    }

    static getLineNumberAtPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length + 1], nameof(pos));
        // do not allocate a string in this method
        let count = 0;

        for (let i = 0; i < pos; i++) {
            if (str[i] === "\n" || (str[i] === "\r" && str[i + 1] !== "\n"))
                count++;
        }

        return count + 1; // convert count to line number
    }

    static getLengthFromLineStartAtPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length + 1], nameof(pos));
        return pos - StringUtils.getLineStartFromPos(str, pos);
    }

    static getLineStartFromPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length + 1], nameof(pos));

        while (pos > 0) {
            const previousChar = str[pos - 1];
            if (previousChar === "\n" || previousChar === "\r")
                break;
            pos--;
        }

        return pos;
    }

    static getLineEndFromPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length + 1], nameof(pos));

        while (pos < str.length) {
            const currentChar = str[pos];
            if (currentChar === "\n" || currentChar === "\r")
                break;
            pos++;
        }

        return pos;
    }

    static escapeForWithinString(str: string, quoteKind: QuoteKind) {
        return StringUtils.escapeChar(str, quoteKind).replace(/(\r?\n)/g, "\\$1");
    }

    /**
     * Escapes all the occurences of the char in the string.
     */
    static escapeChar(str: string, char: string) {
        if (char.length !== 1)
            throw new errors.InvalidOperationError(`Specified char must be one character long.`);

        let result = "";
        for (let i = 0; i < str.length; i++) {
            if (str[i] === char)
                result += "\\";
            result += str[i];
        }
        return result;
    }

    static indent(str: string, times: number, indentText: string, isInStringAtPos: (pos: number) => boolean) {
        // todo: unit test this (right now it's somewhat tested indirectly)
        const unindentRegex = times > 0 ? undefined : new RegExp(getDeindentRegexText());
        const newLines: string[] = [];
        let pos = 0;

        for (const line of str.split("\n")) {
            if (isInStringAtPos(pos))
                newLines.push(line);
            else if (times > 0)
                newLines.push(indentText.repeat(times) + line);
            else // negative
                newLines.push(line.replace(unindentRegex!, ""));

            pos += line.length + 1; // +1 for \n char
        }

        return newLines.join("\n");

        function getDeindentRegexText() {
            let text = "^";
            for (let i = 0; i < Math.abs(times); i++) {
                text += "(";
                if (isSpaces.test(indentText)) {
                    // the optional string makes it possible to unindent when a line doesn't have the full number of spaces
                    for (let j = 0; j < indentText.length; j++)
                        text += " ?";
                }
                else
                    text += indentText;

                text += "|\t)?";
            }

            return text;
        }
    }
}
