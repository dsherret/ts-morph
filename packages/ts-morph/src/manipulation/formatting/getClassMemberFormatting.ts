import { Node } from "../../compiler";
import { FormattingKind } from "./FormattingKind";

export function getClassMemberFormatting(parent: Node, member: Node) {
    if (Node.isAmbientableNode(parent) && parent.isAmbient())
        return FormattingKind.Newline;

    if (hasBody(member))
        return FormattingKind.Blankline;

    return FormattingKind.Newline;
}

function hasBody(node: Node) {
    if (Node.isBodyableNode(node) && node.getBody() != null)
        return true;
    if (Node.isBodiedNode(node))
        return true;
    return false;
}
