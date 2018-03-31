export function isNewLineAtPos(fullText: string, pos: number) {
    return fullText[pos] === "\n" || (fullText[pos] === "\r" && fullText[pos + 1] === "\n");
}
