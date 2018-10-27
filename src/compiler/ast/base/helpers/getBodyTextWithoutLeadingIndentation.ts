import { StringUtils } from "../../../../utils";
import { Node } from "../../common";

/**
 * @internal
 */
export function getBodyTextWithoutLeadingIndentation(body: Node) {
    const sourceFile = body.sourceFile;
    const textArea = body.getChildSyntaxList() || body; // arrow functions don't have a syntax list
    const startPos = textArea.getNonWhitespaceStart();
    const endPos = Math.max(startPos, textArea.getTrailingTriviaNonWhitespaceEnd());
    const width = endPos - startPos;

    if (width === 0)
        return "";

    const fullText = sourceFile.getFullText().substring(startPos, endPos);

    return StringUtils.indent(fullText,
        -1 * textArea.getIndentationLevel(),
        textArea.context.manipulationSettings.getIndentationText(),
        pos => sourceFile.isInStringAtPos(pos + startPos));
}
