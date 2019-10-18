export function getPosAtNextNonBlankLine(text: string, pos: number) {
    let newPos = pos;
    for (let i = pos; i < text.length; i++) {
        if (text[i] === " " || text[i] === "\t")
            continue;
        if (text[i] === "\r" && text[i + 1] === "\n" || text[i] === "\n") {
            newPos = i + 1;
            if (text[i] === "\r") {
                i++;
                newPos++;
            }
            continue;
        }

        return newPos;
    }

    return newPos;
}
