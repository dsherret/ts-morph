import { ts } from "@ts-morph/common";
import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
import { getParentSyntaxList } from "../../utils";
import { NodeHandler } from "./NodeHandler";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

/**
 * Replacement handler that tries to find the parents.
 */
export class ParentFinderReplacementNodeHandler extends StraightReplacementNodeHandler {
    private readonly changingParentParent: Node | undefined;
    private foundParent = false;
    private readonly parentsAtSamePos: boolean;

    constructor(compilerFactory: CompilerFactory, private readonly parentNodeHandler: NodeHandler, private readonly changingParent: Node) {
        super(compilerFactory);
        this.changingParentParent = this.changingParent.getParentSyntaxList() || this.changingParent.getParent();
        this.parentsAtSamePos = this.changingParentParent != null && this.changingParentParent.getPos() === this.changingParent.getPos();
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        if (!this.foundParent && this.isParentNode(newNode, newSourceFile)) {
            this.foundParent = true; // don't bother checking for the parent once it's found
            this.parentNodeHandler.handleNode(currentNode, newNode, newSourceFile);
        }
        else {
            super.handleNode(currentNode, newNode, newSourceFile);
        }
    }

    private isParentNode(newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const positionsAndKindsEqual = areNodesEqual(newNode, this.changingParent)
            && areNodesEqual(getParentSyntaxList(newNode, newSourceFile) || newNode.parent, this.changingParentParent);

        if (!positionsAndKindsEqual)
            return false;

        if (!this.parentsAtSamePos)
            return true;

        // Need to do some additional checks if the parents are in the same position.
        // For example, some nodes like `this` in `this.is.nested.deep;`... in this case, just check the depths are equal
        return getAncestorLength(this.changingParent.compilerNode) === getAncestorLength(newNode);

        function getAncestorLength(nodeToCheck: ts.Node) {
            let node = nodeToCheck;
            let count = 0;
            while (node.parent != null) {
                count++;
                node = node.parent;
            }
            return count;
        }
    }
}

function areNodesEqual(a: ts.Node | undefined, b: Node | undefined) {
    if (a == null && b == null)
        return true;
    if (a == null || b == null)
        return false;
    if (a.pos === b.getPos() && a.kind === b.getKind())
        return true;
    return false;
}
