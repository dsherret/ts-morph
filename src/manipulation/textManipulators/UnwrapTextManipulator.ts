import { Node } from "../../compiler";
import { InsertionTextManipulator } from "./InsertionTextManipulator";

export class UnwrapTextManipulator extends InsertionTextManipulator {
    constructor(node: Node) {
        super({
            insertPos: node.getPos(),
            newText: getReplacementText(node),
            replacingLength: node.getFullWidth()
        });
    }
}

function getReplacementText(node: Node) {
    const childSyntaxList = node.getChildSyntaxListOrThrow();
    const indentationText = node.getIndentationText();
    const childIndentationText = node.getChildIndentationText();
    const indentationDifference = childIndentationText.replace(indentationText, "");
    const replaceRegex = new RegExp("^" + indentationDifference);
    const originalText = childSyntaxList.getFullText();
    const sourceFile = node.sourceFile;
    const lines = originalText.split("\n");

    let pos = childSyntaxList.getPos();
    const newLines: string[] = [];
    for (const line of lines) {
        if (sourceFile.isInStringAtPos(pos))
            newLines.push(line);
        else
            newLines.push(line.replace(replaceRegex, ""));

        pos += line.length + 1;
    }

    return newLines.join("\n").replace(/^\r?\n/, "");
}
