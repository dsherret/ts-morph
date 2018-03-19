import CodeBlockWriter from "code-block-writer";
import {SyntaxKind} from "../../../typescript";
import {insertIntoParentTextRange} from "../../../manipulation";
import {Node} from "../../common";
import {getBodyText} from "./getBodyText";

/**
 * @internal
 */
export function setBodyTextForNode(body: Node, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    const newText = getBodyText(body.getWriterWithIndentation(), textOrWriterFunction);
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
