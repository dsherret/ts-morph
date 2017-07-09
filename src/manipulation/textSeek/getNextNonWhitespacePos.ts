export function getNextNonWhitespacePos(text: string, pos: number) {
    while (pos < text.length) {
        const char = text[pos];
        if (char === " " || char === "\t" || char === "\r" || char === "\n")
            pos++;
        else
            break;
    }

    return pos;
}
