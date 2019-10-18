import { StringUtils } from "@ts-morph/common";
import { Node } from "../../common";

/**
 * @internal
 */
export function getBodyTextWithoutLeadingIndentation(body: Node) {
    const sourceFile = body._sourceFile;
    const textArea = body.getChildSyntaxList() || body; // arrow functions don't have a syntax list
    const startPos = textArea.getNonWhitespaceStart();
    const endPos = Math.max(startPos, textArea._getTrailingTriviaNonWhitespaceEnd());
    const width = endPos - startPos;

    if (width === 0)
        return "";

    const fullText = sourceFile.getFullText().substring(startPos, endPos);
    return StringUtils.removeIndentation(fullText, {
        indentSizeInSpaces: body._context.manipulationSettings._getIndentSizeInSpaces(),
        isInStringAtPos: pos => sourceFile.isInStringAtPos(pos + startPos)
    });
}
