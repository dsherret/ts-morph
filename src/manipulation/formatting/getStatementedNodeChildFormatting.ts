import {ts} from "./../../typescript";
import {Node} from "./../../compiler";
import {TypeGuards} from "./../../utils";
import {FormattingKind} from "./FormattingKind";

export function getStatementedNodeChildFormatting(parent: Node, member: Node) {
    if (hasBody(member))
        return FormattingKind.Blankline;

    return FormattingKind.Newline;
}

export function getClausedNodeChildFormatting(parent: Node, member: Node) {
    return FormattingKind.Newline;
}

function hasBody(node: Node) {
    if (TypeGuards.isBodyableNode(node) && node.getBody() != null)
        return true;
    if (TypeGuards.isBodiedNode(node))
        return true;
    return TypeGuards.isInterfaceDeclaration(node) || TypeGuards.isClassDeclaration(node) || TypeGuards.isEnumDeclaration(node) ||
        TypeGuards.isEnumDeclaration(node);
}
