export class StringUtils {
    private constructor() {
    }

    static isNullOrWhitespace(str: string | undefined) {
        return typeof str !== "string" || str.trim().length === 0;
    }
}
