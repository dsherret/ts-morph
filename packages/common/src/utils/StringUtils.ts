import { errors } from "../errors";
import { CharCodes } from "./CharCodes";

const regExWhitespaceSet = new Set([" ", "\f", "\n", "\r", "\t", "\v", "\u00A0", "\u2028", "\u2029"].map(c => c.charCodeAt(0)));

export class StringUtils {
    private constructor() {
    }

    static isWhitespaceCharCode(charCode: number | undefined) {
        return regExWhitespaceSet.has(charCode!);
    }

    static isSpaces(text: string) {
        if (text == null || text.length === 0)
            return false;

        for (let i = 0; i < text.length; i++) {
            if (text.charCodeAt(i) !== CharCodes.SPACE)
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

    static stripQuotes(text: string) {
        if (StringUtils.isQuoted(text))
            return text.substring(1, text.length - 1);
        return text;
    }

    static isQuoted(text: string) {
        return text.startsWith("'") && text.endsWith("'") || text.startsWith("\"") && text.endsWith("\"");
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
            if (!StringUtils.isWhitespaceCharCode(text.charCodeAt(i)))
                return false;
        }

        return true;
    }

    static startsWithNewLine(str: string | undefined) {
        if (str == null)
            return false;
        return str.charCodeAt(0) === CharCodes.NEWLINE || str.charCodeAt(0) === CharCodes.CARRIAGE_RETURN && str.charCodeAt(1) === CharCodes.NEWLINE;
    }

    static endsWithNewLine(str: string | undefined) {
        if (str == null)
            return false;
        return str.charCodeAt(str.length - 1) === CharCodes.NEWLINE;
    }

    static insertAtLastNonWhitespace(str: string, insertText: string) {
        let i = str.length;
        while (i > 0 && StringUtils.isWhitespaceCharCode(str.charCodeAt(i - 1)))
            i--;
        return str.substring(0, i) + insertText + str.substring(i);
    }

    static getLineNumberAtPos(str: string, pos: number) {
        // do not allocate a string in this method
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));
        let count = 0;

        for (let i = 0; i < pos; i++) {
            if (str.charCodeAt(i) === CharCodes.NEWLINE)
                count++;
        }

        return count + 1; // convert count to line number
    }

    static getPosAtLineNumber(str: string, line: number) {
        const lines = str.split('\n');
        errors.throwIfOutOfRange(line, [1, lines.length], nameof(line));
        let count = 0;

        for (let i = 0; i < line - 1; i++) { // line number is 1-indexed
            count += lines[i].length + 1; // include newline
        }

        return count; // convert count to pos
    }

    static getLengthFromLineStartAtPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));
        return pos - StringUtils.getLineStartFromPos(str, pos);
    }

    static getLineStartFromPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));

        while (pos > 0) {
            const previousCharCode = str.charCodeAt(pos - 1);
            if (previousCharCode === CharCodes.NEWLINE || previousCharCode === CharCodes.CARRIAGE_RETURN)
                break;
            pos--;
        }

        return pos;
    }

    static getLineEndFromPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length], nameof(pos));

        while (pos < str.length) {
            const currentChar = str.charCodeAt(pos);
            if (currentChar === CharCodes.NEWLINE || currentChar === CharCodes.CARRIAGE_RETURN)
                break;
            pos++;
        }

        return pos;
    }

    static escapeForWithinString(str: string, quoteKind: "\"" | "'") {
        return StringUtils.escapeChar(str, quoteKind).replace(/(\r?\n)/g, "\\$1");
    }

    /**
     * Escapes all the occurrences of the char in the string.
     */
    static escapeChar(str: string, char: string) {
        if (char.length !== 1)
            throw new errors.InvalidOperationError(`Specified char must be one character long.`);

        let result = "";
        for (const currentChar of str) {
            if (currentChar === char)
                result += "\\";
            result += currentChar;
        }
        return result;
    }

    static removeIndentation(str: string, opts: { isInStringAtPos: (pos: number) => boolean; indentSizeInSpaces: number; }) {
        const { isInStringAtPos, indentSizeInSpaces } = opts;
        const startPositions: number[] = [];
        const endPositions: number[] = [];
        let minIndentWidth: number | undefined;

        analyze();
        return buildString();

        function analyze() {
            let isAtStartOfLine = str.charCodeAt(0) === CharCodes.SPACE || str.charCodeAt(0) === CharCodes.TAB;

            for (let i = 0; i < str.length; i++) {
                if (!isAtStartOfLine) {
                    if (str.charCodeAt(i) === CharCodes.NEWLINE && !isInStringAtPos(i + 1))
                        isAtStartOfLine = true;
                    continue;
                }

                startPositions.push(i);

                let spacesCount = 0;
                let tabsCount = 0;

                while (true) {
                    if (str.charCodeAt(i) === CharCodes.SPACE)
                        spacesCount++;
                    else if (str.charCodeAt(i) === CharCodes.TAB)
                        tabsCount++;
                    else
                        break;

                    i++;
                }

                // indentation for spaces rounds up to the nearest tab size multiple
                const indentWidth = Math.ceil(spacesCount / indentSizeInSpaces) * indentSizeInSpaces + tabsCount * indentSizeInSpaces;
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
                    if (str.charCodeAt(pos) === CharCodes.SPACE)
                        indentCount++;
                    else if (str.charCodeAt(pos) === CharCodes.TAB)
                        indentCount += indentSizeInSpaces;
                }

                lastEndPos = startPositions[i + 1] == null ? str.length : startPositions[i + 1];
                result += str.substring(pos, lastEndPos);
            }

            result += str.substring(lastEndPos);

            return result;
        }
    }

    static indent(str: string, times: number, options: { indentText: string; indentSizeInSpaces: number; isInStringAtPos: (pos: number) => boolean; }) {
        if (times === 0)
            return str;

        // this assumes that the indentText and indentSizeInSpaces are proportional
        const { indentText, indentSizeInSpaces, isInStringAtPos } = options;
        const fullIndentationText = times > 0 ? indentText.repeat(times) : undefined;
        const totalIndentSpaces = Math.abs(times * indentSizeInSpaces);
        let result = "";
        let lineStart = 0;
        let lineEnd = 0;

        for (let i = 0; i < str.length; i++) {
            lineStart = i;
            while (i < str.length && str.charCodeAt(i) !== CharCodes.NEWLINE)
                i++;
            lineEnd = i === str.length ? i : i + 1;
            appendLine();
        }

        return result;

        function appendLine() {
            if (isInStringAtPos(lineStart))
                result += str.substring(lineStart, lineEnd);
            else if (times > 0)
                result += fullIndentationText + str.substring(lineStart, lineEnd);
            else { // negative times
                let start = lineStart;
                let indentSpaces = 0;
                for (start = lineStart; start < str.length; start++) {
                    if (indentSpaces >= totalIndentSpaces)
                        break;

                    if (str.charCodeAt(start) === CharCodes.SPACE)
                        indentSpaces++;
                    else if (str.charCodeAt(start) === CharCodes.TAB)
                        indentSpaces += indentSizeInSpaces;
                    else
                        break;
                }
                result += str.substring(start, lineEnd);
            }
        }
    }
}
