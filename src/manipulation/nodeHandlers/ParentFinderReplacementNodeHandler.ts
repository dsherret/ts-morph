import {Node} from "../../compiler";
import {CompilerFactory} from "../../factories";
import {ts} from "../../typescript";
import {getParentSyntaxList} from "../../utils";
import {NodeHandler} from "./NodeHandler";
import {StraightReplacementNodeHandler} from "./StraightReplacementNodeHandler";

/**
 * Replacement handler that tries to find the parents.
 */
export class ParentFinderReplacementNodeHandler extends StraightReplacementNodeHandler {
    private readonly changingParentParent: Node | undefined;
    private foundParent = false;

    constructor(compilerFactory: CompilerFactory, private readonly parentNodeHandler: NodeHandler, private readonly changingParent: Node) {
        super(compilerFactory);
        this.changingParentParent = this.changingParent.getParentSyntaxList() || this.changingParent.getParent();
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        if (!this.foundParent && areNodesEqual(newNode, this.changingParent) && areNodesEqual(getParentSyntaxList(newNode) || newNode.parent, this.changingParentParent)) {
            this.foundParent = true; // don't bother checking for the parent once it's found
            this.parentNodeHandler.handleNode(currentNode, newNode, newSourceFile);
        }
        else
            super.handleNode(currentNode, newNode, newSourceFile);
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
