import * as errors from "./../../errors";
import {Node} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {NodeHandler} from "./NodeHandler";
import {NodeHandlerHelper} from "./NodeHandlerHelper";

/**
 * Replacement handler that goes through the tree and forgets any nodes that have changed kind.
 */
export class ForgetChangedNodeHandler implements NodeHandler {
    private readonly helper: NodeHandlerHelper;

    constructor(private readonly compilerFactory: CompilerFactory) {
        this.helper = new NodeHandlerHelper(compilerFactory);
    }

    handleNode(currentNode: Node, newNode: Node) {
        if (currentNode.getKind() !== newNode.getKind()) {
            currentNode.forget();
            return;
        }

        const newNodeChildren = newNode.getChildrenIterator();

        for (const currentNodeChild of currentNode.getCompilerChildren())
            this.helper.handleForValues(this, currentNodeChild, newNodeChildren.next().value);

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
