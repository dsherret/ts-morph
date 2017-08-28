import * as ts from "typescript";
import {insertIntoParent} from "./../../../manipulation";
import {Node} from "./../../common";

/**
 * @internal
 */
export function setBodyTextForNode(body: Node, text: string) {
    const childSyntaxList = body.getChildSyntaxListOrThrow();
    const childrenToRemove = childSyntaxList.getChildren();
    const childIndentationText = body.getChildIndentationText();
    const newLineKind = body.global.manipulationSettings.getNewLineKind();
    const newText = (text.length > 0 ? newLineKind + text.split(/\r?\n/).map(t => t.length > 0 ? childIndentationText + t : t).join(newLineKind) : "") +
        newLineKind + body.getParentOrThrow().getIndentationText();
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
}
