import {ts, SyntaxKind} from "./../../../typescript";
import CodeBlockWriter from "code-block-writer";
import {insertIntoParentTextRange, getIndentedText} from "./../../../manipulation";
import {getTextFromStringOrWriter, StringUtils} from "./../../../utils";
import {Node} from "./../../common";

/**
 * @internal
 */
export function setBodyTextForNode(body: Node, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    const childSyntaxList = body.getChildSyntaxListOrThrow();
    const childrenToRemove = childSyntaxList.getChildren();
    const childIndentationText = body.getChildIndentationText();
    const newLineKind = body.global.manipulationSettings.getNewLineKindAsString();
    const newText = getNewText();
    const openBrace = body.getFirstChildByKindOrThrow(SyntaxKind.FirstPunctuation);
    const closeBrace = body.getFirstChildByKindOrThrow(SyntaxKind.CloseBraceToken);

    insertIntoParentTextRange({
        insertPos: openBrace.getEnd(),
        newText,
        parent: body,
        replacing: {
            textLength: closeBrace.getStart() - openBrace.getEnd()
        }
    });

    function getNewText() {
        let text = getIndentedText({
            textOrWriterFunction,
            manipulationSettings: body.global.manipulationSettings,
            indentationText: childIndentationText
        });

        if (text.length > 0)
            text = newLineKind + text;

        if (!StringUtils.endsWith(text, newLineKind))
            text += newLineKind;

        return text + body.getParentOrThrow().getIndentationText();
    }
}
