import { SyntaxKind, ts } from "@ts-morph/common";
import { Node } from "../../common";
import { JSDocLink } from "../JSDocLink";
import { JSDocLinkCode } from "../JSDocLinkCode";
import { JSDocLinkPlain } from "../JSDocLinkPlain";
import { JSDocText } from "../JSDocText";

/**
 * The comment of a doc comment or one of its tags, as ts-morph reports it.
 *
 * tsgo always stores a comment as an array of parts, where classic TypeScript
 * collapsed one made only of text into a plain string. The parts are only worth
 * surfacing when there is a link among them, so an all-text comment is joined
 * back into the string callers have always been given.
 */
export function getJSDocComment(
  node: { compilerNode: { comment?: string | ts.NodeArray<ts.JSDocComment> } },
  getNode: (compilerNode: ts.JSDocComment) => Node | undefined,
): string | (JSDocText | JSDocLink | JSDocLinkCode | JSDocLinkPlain | undefined)[] | undefined {
  const comment = node.compilerNode.comment;
  if (comment == null)
    return undefined;
  if (typeof comment === "string")
    return comment;
  if (comment.every(part => part.kind === SyntaxKind.JSDocText))
    return comment.map(part => (part as ts.JSDocText).text).join("");
  return comment.map(getNode) as (JSDocText | JSDocLink | JSDocLinkCode | JSDocLinkPlain | undefined)[];
}
