import * as errors from "./../../../errors";
import {Node} from "./../../../compiler";
import {CompilerFactory} from "./../../../factories";
import {NodeHandler} from "./NodeHandler";
import {StraightReplacementNodeHandler} from "./StraightReplacementNodeHandler";

export interface ChangeChildOrderParentHandlerOptions {
    oldIndex: number;
    newIndex: number;
}

/**
 * Node handler for dealing with a parent who has a child that will change order.
 */
export class ChangeChildOrderParentHandler implements NodeHandler {
    private readonly oldIndex: number;
    private readonly newIndex: number;
    private readonly straightReplacementNodeHandler: NodeHandler;

    constructor(private readonly compilerFactory: CompilerFactory, opts: ChangeChildOrderParentHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.oldIndex = opts.oldIndex;
        this.newIndex = opts.newIndex;
    }

    handleNode(currentNode: Node, newNode: Node) {
        const currentNodeChildren = this.getChildrenInNewOrder(currentNode.getChildren());
        const newNodeChildren = newNode.getChildren();

        errors.throwIfNotEqual(newNodeChildren.length, currentNodeChildren.length, "New children length should match the old children length.");

        for (let i = 0; i < newNodeChildren.length; i++)
            this.straightReplacementNodeHandler.handleNode(currentNodeChildren[i], newNodeChildren[i]);

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }

    private getChildrenInNewOrder(children: Node[]) {
        const result = [...children];
        const movingNode = result.splice(this.oldIndex, 1)[0];
        result.splice(this.newIndex, 0, movingNode);
        return result;
    }
}
