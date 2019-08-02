import { Node } from "../../compiler";
import { TypeGuards } from "../../utils";
import { FormattingKind } from "./FormattingKind";

export function getClassMemberFormatting(parent: Node, member: Node) {
    if (TypeGuards.isAmbientableNode(parent) && parent.isAmbient())
        return FormattingKind.Newline;

    if (hasBody(member))
        return FormattingKind.Blankline;

    return FormattingKind.Newline;
}

function hasBody(node: Node) {
    if (TypeGuards.isBodyableNode(node) && node.getBody() != null)
        return true;
    if (TypeGuards.isBodiedNode(node))
        return true;
    return false;
}
