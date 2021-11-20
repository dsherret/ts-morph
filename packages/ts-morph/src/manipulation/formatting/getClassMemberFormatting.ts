import { Node } from "../../compiler";
import { FormattingKind } from "./FormattingKind";

export function getClassMemberFormatting(parent: Node, member: Node) {
  if (Node.isAmbientable(parent) && parent.isAmbient())
    return FormattingKind.Newline;

  if (hasBody(member))
    return FormattingKind.Blankline;

  return FormattingKind.Newline;
}

function hasBody(node: Node) {
  if (Node.isBodyable(node) && node.getBody() != null)
    return true;
  if (Node.isBodied(node))
    return true;
  return false;
}
