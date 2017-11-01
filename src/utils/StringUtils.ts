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

    static endsWith(str: string, endsWithString: string) {
        return str.substr(str.length - endsWithString.length, endsWithString.length) === endsWithString;
    }
}
