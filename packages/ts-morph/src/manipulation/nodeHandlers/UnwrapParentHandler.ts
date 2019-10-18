import { ts } from "@ts-morph/common";
import { Node } from "../../compiler";
import { ExtendedParser } from "../../compiler/ast/utils";
import { CompilerFactory } from "../../factories";
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
        const [currentChildren, newChildren] = this.helper.getCompilerChildrenAsIterators(currentNode, newNode, newSourceFile);
        let index = 0;

        // replace normally until reaching the first child
        while (!currentChildren.done && !newChildren.done && index++ < this.childIndex)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentChildren.next(), newChildren.next(), newSourceFile);

        // the child syntax list's children should map to the newNodes next children
        const currentChild = this.compilerFactory.getExistingCompilerNode(currentChildren.next())!;
        const childSyntaxList = currentChild.getChildSyntaxListOrThrow();
        for (const child of ExtendedParser.getCompilerChildren(childSyntaxList.compilerNode, childSyntaxList._sourceFile.compilerNode))
            this.helper.handleForValues(this.straightReplacementNodeHandler, child, newChildren.next(), newSourceFile);

        // destroy all the current child's children except for the children of its child syntax list
        forgetNodes(currentChild);
        function forgetNodes(node: Node) {
            if (node === childSyntaxList) {
                node._forgetOnlyThis();
                return;
            }

            for (const child of node._getChildrenInCacheIterator())
                forgetNodes(child);

            node._forgetOnlyThis();
        }

        // handle the rest
        while (!currentChildren.done)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentChildren.next(), newChildren.next(), newSourceFile);

        // ensure the new children iterator is done too
        if (!newChildren.done)
            throw new Error("Error replacing tree: Should not have children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }
}
