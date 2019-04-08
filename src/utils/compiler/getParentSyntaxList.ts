﻿import { SyntaxKind, ts } from "../../typescript";

export function getParentSyntaxList(node: ts.Node) {
    if (node.kind === SyntaxKind.EndOfFileToken)
        return undefined;

    const parent = node.parent;
    if (parent == null)
        return undefined;

    const { pos, end } = node;
    // @code-fence-allow(getChildren): The extended comments are not needed here.
    for (const child of parent.getChildren()) {
        if (child.pos > end || child === node)
            return undefined;

        if (child.kind === SyntaxKind.SyntaxList && child.pos <= pos && child.end >= end)
            return child as ts.SyntaxList;
    }

    return undefined; // shouldn't happen
}
