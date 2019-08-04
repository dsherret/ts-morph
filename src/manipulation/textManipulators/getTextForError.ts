export function getTextForError(newText: string, pos: number, length = 0) {
    const startPos = Math.max(0, newText.lastIndexOf("\n", pos) - 100);
    let endPos = Math.min(newText.length, newText.indexOf("\n", pos + length));
    endPos = endPos === -1 ? newText.length : Math.min(newText.length, endPos + 100);

    let text = "";
    text += newText.substring(startPos, endPos);

    if (startPos !== 0)
        text = "..." + text;
    if (endPos !== newText.length)
        text += "...";

    return text;
}
