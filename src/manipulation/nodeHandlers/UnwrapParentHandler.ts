import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
import { ts } from "../../typescript";
import { AdvancedIterator, ArrayUtils } from "../../utils";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

/**
 * Parent handler used to unwrap a node.
 */
export class UnwrapParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly helper: NodeHandlerHelper;

    constructor(private readonly compilerFactory: CompilerFactory, private readonly childIndex: number) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const helper = this.helper;
        const currentNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(currentNode.getCompilerChildren()));
        const newNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(newNode.getChildren(newSourceFile)));
        let index = 0;

        // replace normally until reaching the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && index++ < this.childIndex)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // the child syntax list's children should map to the newNodes next children
        const currentChild = this.compilerFactory.getExistingCompilerNode(currentNodeChildren.next())!;
        const childSyntaxList = currentChild.getChildSyntaxListOrThrow();
        for (const child of childSyntaxList.getCompilerChildren())
            this.helper.handleForValues(this.straightReplacementNodeHandler, child, newNodeChildren.next(), newSourceFile);

        // destroy all the current child's children except for the children of its child syntax list
        forgetNodes(currentChild);
        function forgetNodes(node: Node) {
            if (node === childSyntaxList) {
                node.forgetOnlyThis();
                return;
            }

            for (const child of node.getChildrenInCacheIterator())
                forgetNodes(child);

            node.forgetOnlyThis();
        }

        // handle the rest
        while (!currentNodeChildren.done)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }
}
