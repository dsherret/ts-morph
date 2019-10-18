export function getPosAtEndOfPreviousLineOrNonWhitespace(fullText: string, pos: number) {
    while (pos > 0) {
        pos--;

        const currentChar = fullText[pos];
        if (currentChar === "\n") {
            if (fullText[pos - 1] === "\r")
                return pos - 1;
            return pos;
        }
        else if (currentChar !== " " && currentChar !== "\t") {
            return pos + 1;
        }
    }

    return pos;
}
