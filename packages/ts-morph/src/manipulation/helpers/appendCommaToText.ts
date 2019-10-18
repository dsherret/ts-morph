import { ts } from "@ts-morph/common";
const scanner = ts.createScanner(ts.ScriptTarget.Latest, true);

/**
 * Appends a comma to the text taking into account the various language aspects.
 */
export function appendCommaToText(text: string) {
    const pos = getAppendCommaPos(text);
    if (pos === -1)
        return text;

    return text.substring(0, pos) + "," + text.substring(pos);
}

/**
 * Gets the position in the text that a comma could be appended.
 * @param text - Text to search.
 * @returns The position to append. -1 otherwise.
 */
export function getAppendCommaPos(text: string) {
    scanner.setText(text);

    try {
        if (scanner.scan() === ts.SyntaxKind.EndOfFileToken)
            return -1;

        while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            // just keep scanning...
        }

        const pos = scanner.getStartPos();
        return text[pos - 1] === "," ? -1 : pos;
    } finally {
        // ensure the scanner doesn't hold onto the text so the string
        // gets garbage collected
        scanner.setText(undefined);
    }
}
