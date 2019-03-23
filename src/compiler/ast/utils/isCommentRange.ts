import { ts } from "../../../typescript";

export function isCommentRange(node: (ts.Node | ts.CommentRange)): node is ts.CommentRange {
    return node.kind === ts.SyntaxKind.SingleLineCommentTrivia || node.kind === ts.SyntaxKind.MultiLineCommentTrivia;
}
