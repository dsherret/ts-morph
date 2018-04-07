export function getPosAtEndOfPreviousLineOrNonWhitespace(fullText: string, pos: number) {
    while (pos > 0) {
        pos--;

        const currentChar = fullText[pos];
        if (currentChar === " " || currentChar === "\t")
            continue;
        else if (currentChar === "\n") {
            if (fullText[pos - 1] === "\r")
                return pos - 1;
            return pos;
        }
    }

    return pos;
}
