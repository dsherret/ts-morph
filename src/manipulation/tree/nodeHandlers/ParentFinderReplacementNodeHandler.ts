import {Node} from "./../../../compiler";
import {CompilerFactory} from "./../../../factories";
import {areNodesEqual} from "./../areNodesEqual";
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

    handleNode(currentNode: Node, newNode: Node) {
        if (!this.foundParent && areNodesEqual(newNode, this.changingParent) && areNodesEqual(newNode.getParentSyntaxList() || newNode.getParent(), this.changingParentParent)) {
            this.foundParent = true; // don't bother checking for the parent once it's found
            this.parentNodeHandler.handleNode(currentNode, newNode);
        }
        else
            super.handleNode(currentNode, newNode);
    }
}
