import * as ts from "typescript";

export function syntaxKindToName(kind: ts.SyntaxKind) {
    return ts.SyntaxKind[kind];
}
