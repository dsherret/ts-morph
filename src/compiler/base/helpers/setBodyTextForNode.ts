import * as ts from "typescript";
import CodeBlockWriter from "code-block-writer";
import {insertIntoParent} from "./../../../manipulation";
import {getCodeBlockWriter} from "./../../../utils";
import {Node} from "./../../common";

/**
 * @internal
 */
export function setBodyTextForNode(body: Node, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    const childSyntaxList = body.getChildSyntaxListOrThrow();
    const childrenToRemove = childSyntaxList.getChildren();
    const childIndentationText = body.getChildIndentationText();
    const newLineKind = body.global.manipulationSettings.getNewLineKind();
    const newText = getNewText();
    const openBrace = body.getFirstChildByKindOrThrow(ts.SyntaxKind.FirstPunctuation);
    const closeBrace = body.getFirstChildByKindOrThrow(ts.SyntaxKind.CloseBraceToken);

    // ideally this wouldn't replace the existing syntax list
    insertIntoParent({
        insertPos: openBrace.getEnd(),
        childIndex: childSyntaxList.getChildIndex(),
        insertItemsCount: 1,
        newText,
        parent: body,
        replacing: {
            length: closeBrace.getStart() - openBrace.getEnd(),
            nodes: [childSyntaxList]
        }
    });

    function getNewText() {
        let text = getTextFromParam() || "";
        if (text.length > 0)
            text = newLineKind + text.split(/\r?\n/).map(t => t.length > 0 ? childIndentationText + t : t).join(newLineKind);

        if (!text.endsWith(newLineKind))
            text += newLineKind;

        return text + body.getParentOrThrow().getIndentationText();
    }

    function getTextFromParam() {
        if (typeof textOrWriterFunction === "string")
            return textOrWriterFunction;

        const writer = getCodeBlockWriter(body.global.manipulationSettings);
        textOrWriterFunction(writer);
        return writer.toString();
    }
}
