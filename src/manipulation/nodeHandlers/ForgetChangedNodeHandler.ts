import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
import { ts } from "../../typescript";
import { ArrayUtils } from "../../utils";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";

/**
 * Replacement handler that goes through the tree and forgets any nodes that have changed kind.
 */
export class ForgetChangedNodeHandler implements NodeHandler {
    private readonly helper: NodeHandlerHelper;

    constructor(private readonly compilerFactory: CompilerFactory) {
        this.helper = new NodeHandlerHelper(compilerFactory);
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        if (currentNode.getKind() !== newNode.kind) {
            currentNode.forget();
            return;
        }

        const [currentNodeChildren, newNodeChildrenArray] = this.helper.getChildrenFast(currentNode, newNode, newSourceFile);
        const newNodeChildren = ArrayUtils.toIterator(newNodeChildrenArray);

        for (const currentNodeChild of currentNodeChildren)
            this.helper.handleForValues(this, currentNodeChild, newNodeChildren.next().value, newSourceFile);

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }
}
