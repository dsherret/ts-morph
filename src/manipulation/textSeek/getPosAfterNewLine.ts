export function getPosAfterNewLine(text: string, pos: number) {
    while (pos < text.length) {
        if (text[pos] === "\n")
            return pos + 1;
        pos++;
    }
    return pos;
}
