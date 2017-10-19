import * as errors from "./../../../errors";
import {Node} from "./../../../compiler";
import {CompilerFactory} from "./../../../factories";
import {getInsertErrorMessageText} from "./../../getInsertErrorMessageText";
import {NodeHandler} from "./NodeHandler";

/**
 * Replacement handler for replacing parts of the tree that should be equal.
 */
export class StraightReplacementNodeHandler implements NodeHandler {
    constructor(private readonly compilerFactory: CompilerFactory) {
    }

    handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error replacing tree!", currentNode, newNode));

        const newNodeChildren = newNode.getChildrenIterator();

        for (const currentNodeChild of currentNode.getChildrenIterator()) {
            const newNodeChild = newNodeChildren.next().value;
            this.handleNode(currentNodeChild, newNodeChild);
        }

        /* istanbul ignore if */
        if (!newNodeChildren.next().done)
            throw new Error("Error replacing tree: Should not have new children left over."); // todo: better error message

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
