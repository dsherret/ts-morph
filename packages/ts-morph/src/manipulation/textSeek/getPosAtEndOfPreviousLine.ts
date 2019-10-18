export function getPosAtEndOfPreviousLine(fullText: string, pos: number) {
    while (pos > 0) {
        pos--;
        if (fullText[pos] === "\n") {
            if (fullText[pos - 1] === "\r")
                return pos - 1;
            return pos;
        }
    }

    return pos;
}
