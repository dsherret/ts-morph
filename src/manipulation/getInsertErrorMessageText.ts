import {Node} from "./../compiler";

/* istanbul ignore next */
export function getInsertErrorMessageText(preText: string, currentNode: Node, newNode: Node) {
    let text = `${preText} Perhaps a syntax error was inserted (Current: ${currentNode.getKindName()} -- New: ${newNode.getKindName()}).\n\nCode:\n`;
    const sourceFileText = newNode.getSourceFileOrThrow().getFullText();
    const startPos = sourceFileText.lastIndexOf("\n", newNode.getPos()) + 1;
    let endPos = sourceFileText.indexOf("\n", newNode.getEnd());
    if (endPos === -1)
        endPos = sourceFileText.length;
    text += sourceFileText.substring(startPos, endPos);
    return text;
}
