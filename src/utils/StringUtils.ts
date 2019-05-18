import { QuoteKind } from "../compiler";
import * as errors from "../errors";

const regExWhitespaceSet = new Set<string>([" ", "\f", "\n", "\r", "\t", "\v", "\u00A0", "\u2028", "\u2029"]);

export class StringUtils {
    private constructor() {
    }

    static isWhitespaceChar(char: string | undefined) {
        return regExWhitespaceSet.has(char!);
    }

    static isSpaces(text: string) {
        if (text == null || text.length === 0)
            return false;

        for (let i = 0; i < text.length; i++) {
            if (text[i] !== " ")
                return false;
        }

        return true;
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

    static isWhitespace(text: string | undefined) {
        if (text == null)
            return true; // might as well since text.length === 0 returns true

        for (let i = 0; i < text.length; i++) {
            if (!StringUtils.isWhitespaceChar(text[i]))
                return false;
        }

        return true;
    }

    static startsWithNewLine(str: string | undefined) {
        if (str == null)
            return false;
        return str[0] === "\n" || str[0] === "\r" && str[1] === "\n";
    }

    static endsWithNewLine(str: string | undefined) {
        if (str == null)
            return false;
        return str[str.length - 1] === "\n";
    }

    static insertAtLastNonWhitespace(str: string, insertText: string) {
        let i = str.length;
        while (i > 0 && StringUtils.isWhitespaceChar(str[i - 1]))
            i--;
        return str.substring(0, i) + insertText + str.substring(i);
    }

    static getLineNumberAtPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));
        // do not allocate a string in this method
        let count = 0;

        for (let i = 0; i < pos; i++) {
            if (str[i] === "\n" || (str[i] === "\r" && str[i + 1] !== "\n"))
                count++;
        }

        return count + 1; // convert count to line number
    }

    static getLengthFromLineStartAtPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));
        return pos - StringUtils.getLineStartFromPos(str, pos);
    }

    static getLineStartFromPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));

        while (pos > 0) {
            const previousChar = str[pos - 1];
            if (previousChar === "\n" || previousChar === "\r")
                break;
            pos--;
        }

        return pos;
    }

    static getLineEndFromPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));

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
     * Escapes all the occurrences of the char in the string.
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

    static removeIndentation(str: string, opts: { isInStringAtPos: (pos: number) => boolean; tabSize: number; }) {
        const { isInStringAtPos, tabSize } = opts;
        const startPositions: number[] = [];
        const endPositions: number[] = [];
        let minIndentWidth: number | undefined;

        analyze();
        return buildString();

        function analyze() {
            let isAtStartOfLine = str[0] === " " || str[0] === "\t";

            for (let i = 0; i < str.length; i++) {
                if (isAtStartOfLine)
                    startPositions.push(i);
                else {
                    if (str[i] === "\n" && !isInStringAtPos(i + 1))
                        isAtStartOfLine = true;
                    continue;
                }

                let spacesCount = 0;
                let tabsCount = 0;

                while (true) {
                    if (str[i] === " ")
                        spacesCount++;
                    else if (str[i] === "\t")
                        tabsCount++;
                    else
                        break;

                    i++;
                }

                // indentation for spaces rounds up to the nearest tab size multiple
                const indentWidth = Math.ceil(spacesCount / tabSize) * tabSize + tabsCount * tabSize;
                if (minIndentWidth == null || indentWidth < minIndentWidth)
                    minIndentWidth = indentWidth;

                endPositions.push(i);
                isAtStartOfLine = false;
            }
        }

        function buildString() {
            if (startPositions.length === 0)
                return str;
            if (minIndentWidth == null || minIndentWidth === 0)
                return str;

            const deindentWidth = minIndentWidth;
            let result = "";
            result += str.substring(0, startPositions[0]);
            let lastEndPos = startPositions[0];

            for (let i = 0; i < startPositions.length; i++) {
                const startPosition = startPositions[i];
                const endPosition = endPositions[i];
                let indentCount = 0;
                let pos: number;
                for (pos = startPosition; pos < endPosition; pos++) {
                    if (indentCount >= deindentWidth)
                        break;
                    if (str[pos] === " ")
                        indentCount++;
                    else if (str[pos] === "\t")
                        indentCount += tabSize;
                }

                lastEndPos = startPositions[i + 1] == null ? str.length : startPositions[i + 1];
                result += str.substring(pos, lastEndPos);
            }

            result += str.substring(lastEndPos);

            return result;
        }
    }

    static indent(str: string, times: number, indentText: string, isInStringAtPos: (pos: number) => boolean) {
        // todo: unit test this (right now it's somewhat tested indirectly)
        const unIndentRegex = times > 0 ? undefined : new RegExp(getDeIndentRegexText());
        const newLines: string[] = [];
        let pos = 0;

        for (const line of str.split("\n")) {
            if (isInStringAtPos(pos))
                newLines.push(line);
            else if (times > 0)
                newLines.push(indentText.repeat(times) + line);
            else // negative
                newLines.push(line.replace(unIndentRegex!, ""));

            pos += line.length + 1; // +1 for \n char
        }

        return newLines.join("\n");

        function getDeIndentRegexText() {
            let text = "^";
            for (let i = 0; i < Math.abs(times); i++) {
                text += "(";
                if (StringUtils.isSpaces(indentText)) {
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
