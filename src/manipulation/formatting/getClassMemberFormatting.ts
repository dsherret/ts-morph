import * as ts from "typescript";
import {Node, ClassDeclaration} from "./../../compiler";
import {FormattingKind} from "./FormattingKind";

export function getClassMemberFormatting(parent: ClassDeclaration, member: Node) {
    if (parent.isAmbient())
        return FormattingKind.Newline;

    if (hasBody(member))
        return FormattingKind.Blankline;

    return FormattingKind.Newline;
}

function hasBody(node: Node) {
    if (node.isBodyableNode() && node.getBody() != null)
        return true;
    if (node.isBodiedNode())
        return true;
    return false;
}
