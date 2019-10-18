import { Node } from "../../compiler";
import { errors, ts } from "@ts-morph/common";
import { CompilerFactory } from "../../factories";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

export interface ChangeChildOrderParentHandlerOptions {
    oldIndex: number;
    newIndex: number;
}

/**
 * Node handler for dealing with a parent who has a child that will change order.
 */
export class ChangeChildOrderParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: NodeHandler;
    private readonly helper: NodeHandlerHelper;
    private readonly oldIndex: number;
    private readonly newIndex: number;

    constructor(private readonly compilerFactory: CompilerFactory, opts: ChangeChildOrderParentHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.oldIndex = opts.oldIndex;
        this.newIndex = opts.newIndex;
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const [currentChildren, newChildren] = this.helper.getCompilerChildren(currentNode, newNode, newSourceFile);
        const currentChildrenInNewOrder = this.getChildrenInNewOrder(currentChildren);

        errors.throwIfNotEqual(newChildren.length, currentChildrenInNewOrder.length, "New children length should match the old children length.");

        for (let i = 0; i < newChildren.length; i++)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentChildrenInNewOrder[i], newChildren[i], newSourceFile);

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private getChildrenInNewOrder(children: ts.Node[]) {
        const result = [...children];
        const movingNode = result.splice(this.oldIndex, 1)[0];
        result.splice(this.newIndex, 0, movingNode);
        return result;
    }
}
