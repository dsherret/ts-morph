import { ts } from "@ts-morph/common";

export function isComment(node: { kind: ts.SyntaxKind; }) {
    return node.kind === ts.SyntaxKind.SingleLineCommentTrivia
        || node.kind === ts.SyntaxKind.MultiLineCommentTrivia;
}
