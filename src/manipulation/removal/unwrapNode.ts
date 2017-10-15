import * as ts from "typescript";
import {Node} from "./../../compiler";
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
    const stringNodes = childSyntaxList.getDescendants().filter(n => n.getKind() === ts.SyntaxKind.StringLiteral ||
        n.getKind() === ts.SyntaxKind.FirstTemplateToken || n.getKind() === ts.SyntaxKind.TemplateHead ||
        n.getKind() === ts.SyntaxKind.TemplateMiddle || n.getKind() === ts.SyntaxKind.LastTemplateToken);
    const originalText = childSyntaxList.getFullText();
    const lines = originalText.split("\n");

    let pos = childSyntaxList.getPos();
    const newLines: string[] = [];
    for (const line of lines) {
        if (stringNodes.some(n => n.getStart() <= pos && n.getEnd() > pos))
            newLines.push(line);
        else
            newLines.push(line.replace(replaceRegex, ""));

        pos += line.length + 1;
    }

    return newLines.join("\n").replace(/^\r?\n/, "");
}
