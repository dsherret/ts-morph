import * as ts from "typescript";

/**
 * Gets if the kind is a string kind.
 * @param kind - Node kind.
 */
export function isStringKind(kind: ts.SyntaxKind) {
    switch (kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.FirstTemplateToken:
        case ts.SyntaxKind.TemplateHead:
        case ts.SyntaxKind.TemplateMiddle:
        case ts.SyntaxKind.LastTemplateToken:
            return true;
        default:
            return false;
    }
}
