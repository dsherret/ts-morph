import { Node, SyntaxList } from "../../compiler";
import { Chars } from "../../constants";
import { SyntaxKind } from "../../typescript";
import { TypeGuards } from "../../utils";
import { getPosAtStartOfLineOrNonWhitespace } from "../textSeek";

/**
 * Gets the insert pos from an index.
 */
export function getInsertPosFromIndex(index: number, syntaxList: SyntaxList, children: Node[]) {
    if (index === 0) {
        const parent = syntaxList.getParentOrThrow();
        if (TypeGuards.isSourceFile(parent))
            return parent.getFullText()[0] === Chars.BOM ? 1 : 0;
        else if (TypeGuards.isCaseClause(parent) || TypeGuards.isDefaultClause(parent)) {
            const block = parent.getFirstChildIfKind(SyntaxKind.Block);
            const colonToken = parent.getFirstChildByKindOrThrow(SyntaxKind.ColonToken);
            return colonToken.getEnd();
        }

        const isInline = syntaxList !== parent.getChildSyntaxList();
        if (isInline)
            return syntaxList.getStart();

        const parentContainer = getParentContainer(parent);
        const openBraceToken = parentContainer.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
        return openBraceToken.getEnd();
    }
    else
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

    // use the start of the current line instead of the end of the previous line so that
    // this works the same for code at the start of the file
    return getPosAtStartOfLineOrNonWhitespace(fullText, endPos);
}

function getParentContainer(parent: Node) {
    if (TypeGuards.isBodiedNode(parent))
        return parent.getBody();
    if (TypeGuards.isBodyableNode(parent))
        return parent.getBodyOrThrow();
    else
        return parent;
}
