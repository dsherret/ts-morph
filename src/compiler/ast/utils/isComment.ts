import { ts } from "../../../typescript";

export function isComment(node: ts.Node) {
    return node.kind === ts.SyntaxKind.SingleLineCommentTrivia
        || node.kind === ts.SyntaxKind.MultiLineCommentTrivia;
}
