import * as ts from "typescript";
import {Node} from "./../compiler";

/**
 * Gets if the node is a string node.
 * @param node - Node.
 */
export function isStringNode(node: Node) {
    switch (node.getKind()) {
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
