import { QuoteKind } from "../compiler";
import * as errors from "../errors";

export class StringUtils {
    private constructor() {
    }

    static isNullOrWhitespace(str: string | undefined): str is undefined {
        return typeof str !== "string" || str.trim().length === 0;
    }

    static repeat(str: string, times: number) {
        let newStr = "";
        for (let i = 0; i < times; i++)
            newStr += str;
        return newStr;
    }

    static startsWith(str: string, startsWithString: string) {
        if (typeof String.prototype.startsWith === "function")
            return str.startsWith(startsWithString);
        return Es5StringUtils.startsWith(str, startsWithString);
    }

    static endsWith(str: string, endsWithString: string) {
        if (typeof String.prototype.endsWith === "function")
            return str.endsWith(endsWithString);
        return Es5StringUtils.endsWith(str, endsWithString);
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
        const startPos = pos;

        while (pos > 0) {
            const previousChar = str[pos - 1];
            if (previousChar === "\n" || previousChar === "\r")
                break;
            pos--;
        }

        return startPos - pos;
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
}

export class Es5StringUtils {
    static startsWith(str: string, startsWithString: string) {
        return str.substr(0, startsWithString.length) === startsWithString;
    }

    static endsWith(str: string, endsWithString: string) {
        return str.substr(str.length - endsWithString.length, endsWithString.length) === endsWithString;
    }
}
