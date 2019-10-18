import { ArrayUtils, ts } from "@ts-morph/common";
import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
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

        if (currentNode._hasWrappedChildren())
            this.handleChildren(currentNode, newNode, newSourceFile);

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private handleChildren(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const [currentNodeChildren, newNodeChildrenArray] = this.helper.getChildrenFast(currentNode, newNode, newSourceFile);
        const newNodeChildren = ArrayUtils.toIterator(newNodeChildrenArray);

        for (const currentNodeChild of currentNodeChildren) {
            const nextNodeChildResult = newNodeChildren.next();
            if (nextNodeChildResult.done) {
                const existingNode = this.compilerFactory.getExistingCompilerNode(currentNodeChild);
                if (existingNode != null)
                    existingNode.forget();
            }
            else {
                this.helper.handleForValues(this, currentNodeChild, nextNodeChildResult.value, newSourceFile);
            }
        }
    }
}
