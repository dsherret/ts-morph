import { SyntaxKind } from "@ts-morph/common";

/**
 * Gets if the kind is a string kind.
 * @param kind - Node kind.
 */
export function isStringKind(kind: SyntaxKind) {
    switch (kind) {
        case SyntaxKind.StringLiteral:
        case SyntaxKind.NoSubstitutionTemplateLiteral:
        case SyntaxKind.TemplateHead:
        case SyntaxKind.TemplateMiddle:
        case SyntaxKind.TemplateTail:
            return true;
        default:
            return false;
    }
}
