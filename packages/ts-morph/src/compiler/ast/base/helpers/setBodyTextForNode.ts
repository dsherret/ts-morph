import { SyntaxKind } from "@ts-morph/common";
import { insertIntoParentTextRange } from "../../../../manipulation";
import { WriterFunction } from "../../../../types";
import { Node } from "../../common";
import { getBodyText } from "./getBodyText";

/**
 * @internal
 */
export function setBodyTextForNode(body: Node, textOrWriterFunction: string | WriterFunction) {
    const newText = getBodyText(body._getWriterWithIndentation(), textOrWriterFunction);
    const openBrace = body.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
    const closeBrace = body.getFirstChildByKindOrThrow(SyntaxKind.CloseBraceToken);

    insertIntoParentTextRange({
        insertPos: openBrace.getEnd(),
        newText,
        parent: body,
        replacing: {
            textLength: closeBrace.getStart() - openBrace.getEnd()
        }
    });
}
