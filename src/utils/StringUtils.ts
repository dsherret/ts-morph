import * as errors from "./../errors";

export class StringUtils {
    private constructor() {
    }

    static isNullOrWhitespace(str: string | undefined) {
        return typeof str !== "string" || str.trim().length === 0;
    }

    static repeat(str: string, times: number) {
        let newStr = "";
        for (let i = 0; i < times; i++)
            newStr += str;
        return newStr;
    }

    static startsWith(str: string, startsWithString: string) {
        return str.substr(0, startsWithString.length) === startsWithString;
    }

    static endsWith(str: string, endsWithString: string) {
        return str.substr(str.length - endsWithString.length, endsWithString.length) === endsWithString;
    }

    static getLineNumberFromPos(str: string, pos: number) {
        errors.throwIfOutOfRange(pos, [0, str.length + 1], nameof(pos));
        // do not allocate a string in this method
        let count = 0;

        for (let i = 0; i < pos; i++) {
            if (str[i] === "\n" || (str[i] === "\r" && str[i + 1] !== "\n"))
                count++;
        }

        return count + 1; // convert count to line number
    }
}
