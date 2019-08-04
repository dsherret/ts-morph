export function getPosAtStartOfLineOrNonWhitespace(fullText: string, pos: number) {
    while (pos > 0) {
        pos--;

        const currentChar = fullText[pos];
        if (currentChar === "\n")
            return pos + 1;
        else if (currentChar !== " " && currentChar !== "\t")
            return pos + 1;
    }

    return pos;
}
