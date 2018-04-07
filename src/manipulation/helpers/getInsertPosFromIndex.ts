import {ts, SyntaxKind} from "../../typescript";
import {Node} from "../../compiler";
import {TypeGuards} from "../../utils";
import {getPosAtEndOfPreviousLineOrNonWhitespace} from "../textSeek";

/**
 * Gets the insert pos from an index.
 */
export function getInsertPosFromIndex(index: number, parent: Node, children: Node[]) {
    if (index === 0) {
        if (TypeGuards.isSourceFile(parent))
            return 0;
        else if (TypeGuards.isCaseClause(parent) || TypeGuards.isDefaultClause(parent)) {
            const colonToken = parent.getFirstChildByKindOrThrow(SyntaxKind.ColonToken);
            return colonToken.getEnd();
        }
        else {
            const parentContainer = getParentContainer(parent);
            const openBraceToken = parentContainer.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
            return openBraceToken.getEnd();
        }
    }

    return children[index - 1].getEnd();
}

export function getEndPosFromIndex(index: number, parent: Node, children: Node[], fullText: string) {
    let endPos: number;
    if (index === children.length) {
        if (TypeGuards.isSourceFile(parent))
            endPos = parent.getEnd();
        else if (TypeGuards.isCaseClause(parent) || TypeGuards.isDefaultClause(parent))
            endPos = parent.getEnd();
        else {
            const parentContainer = getParentContainer(parent);
            const closeBraceToken = parentContainer.getLastChildByKind(SyntaxKind.CloseBraceToken);
            if (closeBraceToken == null)
                endPos = parent.getEnd();
            else
                endPos = closeBraceToken.getNonWhitespaceStart();
        }
    }
    else
        endPos = children[index].getNonWhitespaceStart();

    return getPosAtEndOfPreviousLineOrNonWhitespace(fullText, endPos);
}

function getParentContainer(parent: Node) {
    if (TypeGuards.isBodiedNode(parent))
        return parent.getBody();
    if (TypeGuards.isBodyableNode(parent))
        return parent.getBodyOrThrow();
    else
        return parent;
}
