import { errors, SyntaxKind } from "@ts-morph/common";
import { Node, SyntaxList } from "../../compiler";
import { getPosAtStartOfLineOrNonWhitespace } from "../textSeek";

/**
 * Gets the insert pos from an index.
 */
export function getInsertPosFromIndex(index: number, syntaxList: SyntaxList, children: Node[]) {
  if (index === 0) {
    const parent = syntaxList.getParentOrThrow();
    if (Node.isSourceFile(parent))
      return 0;
    else if (Node.isCaseClause(parent) || Node.isDefaultClause(parent)) {
      const colonToken = parent.getFirstChildByKindOrThrow(SyntaxKind.ColonToken);
      return colonToken.getEnd();
    }

    const isInline = syntaxList !== parent.getChildSyntaxList();
    if (isInline)
      return syntaxList.getStart();

    const parentContainer = getParentContainerOrThrow(parent);
    const openBraceToken = parentContainer.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
    return openBraceToken.getEnd();
  } else {
    return children[index - 1].getEnd();
  }
}

export function getEndPosFromIndex(index: number, parent: Node, children: Node[], fullText: string) {
  let endPos: number;
  if (index === children.length) {
    if (Node.isSourceFile(parent))
      endPos = parent.getEnd();
    else if (Node.isCaseClause(parent) || Node.isDefaultClause(parent))
      endPos = parent.getEnd();
    else {
      const parentContainer = getParentContainerOrThrow(parent);
      const closeBraceToken = parentContainer.getLastChildByKind(SyntaxKind.CloseBraceToken);
      if (closeBraceToken == null)
        endPos = parent.getEnd();
      else
        endPos = closeBraceToken.getStart();
    }
  } else {
    endPos = children[index].getNonWhitespaceStart();
  }

  // use the start of the current line instead of the end of the previous line so that
  // this works the same for code at the start of the file
  return getPosAtStartOfLineOrNonWhitespace(fullText, endPos);
}

function getParentContainerOrThrow(parent: Node) {
  if (Node.isModuleDeclaration(parent)) {
    const innerBody = parent._getInnerBody();
    if (innerBody == null)
      throw new errors.InvalidOperationError("This operation requires the module to have a body.");
    return innerBody;
  } else if (Node.isBodied(parent))
    return parent.getBody();
  else if (Node.isBodyable(parent))
    return parent.getBodyOrThrow();
  else
    return parent;
}
