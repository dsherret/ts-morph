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
        const currentNodeChildren = currentNode.getChildren();
        const newNodeChildren = newNode.getChildren();

        errors.throwIfNotEqual(newNodeChildren.length, currentNodeChildren.length, "New children length should match the old children length.");

        for (let i = 0; i < newNodeChildren.length; i++) {
            if (i === this.newIndex)
                this.straightReplacementNodeHandler.handleNode(currentNodeChildren[this.oldIndex], newNodeChildren[this.newIndex]);
            else if (i === this.oldIndex)
                this.straightReplacementNodeHandler.handleNode(currentNodeChildren[this.newIndex], newNodeChildren[this.oldIndex]);
            else
                this.straightReplacementNodeHandler.handleNode(currentNodeChildren[i], newNodeChildren[i]);
        }

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
