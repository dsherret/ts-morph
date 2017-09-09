import * as ts from "typescript";
import {Node} from "./../../compiler";
import {FormattingKind} from "./FormattingKind";

export function getStatementedNodeChildFormatting(parent: Node, member: Node) {
    if (hasBody(member))
        return FormattingKind.Blankline;

    return FormattingKind.Newline;
}

function hasBody(node: Node) {
    if (node.isBodyableNode() && node.getBody() != null)
        return true;
    if (node.isBodiedNode())
        return true;
    // todo: use #22 once implemented
    return node.isInterfaceDeclaration() || node.getKind() === ts.SyntaxKind.ClassDeclaration || node.getKind() === ts.SyntaxKind.EnumDeclaration ||
        node.getKind() === ts.SyntaxKind.EnumDeclaration;
}
