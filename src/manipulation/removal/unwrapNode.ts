import * as ts from "typescript";
import {Node} from "./../../compiler";
import {isStringNode} from "./../../utils";
import {replaceTreeUnwrappingNode} from "./../tree";
import {getNewReplacementSourceFile} from "./../insertion/getNewReplacementSourceFile";

export function unwrapNode(node: Node) {
    const tempSourceFile = getNewReplacementSourceFile({
        sourceFile: node.getSourceFile(),
        insertPos: node.getPos(),
        newText: getReplacementText(node),
        replacingLength: node.getFullWidth()
    });

    replaceTreeUnwrappingNode({
        parent: node.getParentSyntaxList() || node.getParentOrThrow(),
        childIndex: node.getChildIndex(),
        replacementSourceFile: tempSourceFile
    });
}

function getReplacementText(node: Node) {
    const childSyntaxList = node.getChildSyntaxListOrThrow();
    const indentationText = node.getIndentationText();
    const childIndentationText = node.getChildIndentationText();
    const indentationDifference = childIndentationText.replace(indentationText, "");
    const replaceRegex = new RegExp("^" + indentationDifference);
    const stringNodeRanges = childSyntaxList.getDescendants().filter(n => isStringNode(n)).map(n => [n.getStart(), n.getEnd()] as [number, number]);
    const originalText = childSyntaxList.getFullText();
    const lines = originalText.split("\n");

    let pos = childSyntaxList.getPos();
    const newLines: string[] = [];
    for (const line of lines) {
        if (stringNodeRanges.some(n => n[0] < pos && n[1] > pos))
            newLines.push(line);
        else
            newLines.push(line.replace(replaceRegex, ""));

        pos += line.length + 1;
    }

    return newLines.join("\n").replace(/^\r?\n/, "");
}
