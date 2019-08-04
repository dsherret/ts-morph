export function getPosAfterPreviousNonBlankLine(text: string, pos: number) {
    let newPos = pos;
    for (let i = pos - 1; i >= 0; i--) {
        if (text[i] === " " || text[i] === "\t")
            continue;
        if (text[i] === "\n") {
            newPos = i + 1;
            if (text[i - 1] === "\r")
                i--;
            continue;
        }

        return newPos;
    }

    return 0;
}
