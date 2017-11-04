import * as ts from "typescript";
import {Node} from "./../../compiler";
import {TypeGuards} from "./../../utils";

/**
 * Gets the insert pos from an index.
 */
export function getInsertPosFromIndex(index: number, parent: Node, children: Node[]) {
    if (index === 0) {
        if (TypeGuards.isSourceFile(parent))
            return 0;
        else {
            const parentContainer = getParentContainer(parent);
            const openBraceToken = parentContainer.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            return openBraceToken.getEnd();
        }
    }

    return children[index - 1].getEnd();
}

function getParentContainer(parent: Node) {
    if (TypeGuards.isBodiedNode(parent))
        return parent.getBody();
    if (TypeGuards.isBodyableNode(parent))
        return parent.getBodyOrThrow();
    else
        return parent;
}
