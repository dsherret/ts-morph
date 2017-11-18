import * as errors from "./../../../errors";
import {Node} from "./../../../compiler";
import {CompilerFactory} from "./../../../factories";
import {NodeHandler} from "./NodeHandler";

/**
 * Replacement handler that goes through the tree and disposes any nodes that have changed kind.
 */
export class DisposeChangedNodeHandler implements NodeHandler {
    constructor(private readonly compilerFactory: CompilerFactory) {
    }

    handleNode(currentNode: Node, newNode: Node) {
        if (currentNode.getKind() !== newNode.getKind()) {
            newNode.setSourceFile(currentNode.sourceFile);
            currentNode.dispose();
            return;
        }

        const newNodeChildren = newNode.getChildrenIterator();

        for (const currentNodeChild of currentNode.getChildrenIterator()) {
            const newNodeChild = newNodeChildren.next().value;
            this.handleNode(currentNodeChild, newNodeChild);
        }

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
