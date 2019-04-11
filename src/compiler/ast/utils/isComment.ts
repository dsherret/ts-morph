import { ts } from "../../../typescript";

export function isComment(node: { kind: ts.SyntaxKind; }) {
    return node.kind === ts.SyntaxKind.SingleLineCommentTrivia
        || node.kind === ts.SyntaxKind.MultiLineCommentTrivia;
}
