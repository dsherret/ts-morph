import { errors } from "../errors";

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
            if (!StringUtils.isWhitespaceCharCode(text.charCodeAt(i)))
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
        while (i > 0 && StringUtils.isWhitespaceCharCode(str.charCodeAt(i - 1)))
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
            let isAtStartOfLine = str[0] === " " || str[0] === "\t";

            for (let i = 0; i < str.length; i++) {
                if (!isAtStartOfLine) {
                    if (str[i] === "\n" && !isInStringAtPos(i + 1))
                        isAtStartOfLine = true;
                    continue;
                }

                startPositions.push(i);

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
                    if (str[pos] === " ")
                        indentCount++;
                    else if (str[pos] === "\t")
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
            while (i < str.length && str[i] !== "\n")
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

                    if (str[start] === " ")
                        indentSpaces++;
                    else if (str[start] === "\t")
                        indentSpaces += indentSizeInSpaces;
                    else
                        break;
                }
                result += str.substring(start, lineEnd);
            }
        }
    }
}
