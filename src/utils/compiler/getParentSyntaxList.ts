import { SyntaxKind, ts } from "../../typescript";

export function getParentSyntaxList(node: ts.Node) {
    const parent = node.parent;
    if (parent == null)
        return undefined;

    const {pos, end} = node;
    for (const child of parent.getChildren()) {
        if (child.pos > end || child === node)
            return undefined;

        if (child.kind === SyntaxKind.SyntaxList && child.pos <= pos && child.end >= end)
            return child;
    }

    return undefined; // shouldn't happen
}
