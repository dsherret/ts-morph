import {Node} from "./../compiler";

/* istanbul ignore next */
export function getInsertErrorMessageText(preText: string, currentNode: Node, newNode: Node) {
    let text = `${preText} Perhaps a syntax error was inserted (Current: ${currentNode.getKindName()} -- New: ${newNode.getKindName()}).\n\nCode:\n`;
    const sourceFileText = newNode.getSourceFile().getFullText();
    const startPos = Math.max(0, sourceFileText.lastIndexOf("\n", newNode.getPos()) - 50);
    let endPos = Math.min(sourceFileText.length, sourceFileText.indexOf("\n", newNode.getEnd()) + 50);
    if (endPos === -1)
        endPos = sourceFileText.length;
    text += sourceFileText.substring(startPos, endPos);

    if (startPos !== 0)
        text = "..." + text;
    if (endPos !== sourceFileText.length)
        text += "...";

    return text;
}
