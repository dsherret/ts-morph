import { ArrayUtils, ts } from "@ts-morph/common";
import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
import { AdvancedIterator } from "../../utils";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

export interface RangeHandlerOptions {
    start: number;
    end: number;
    // replacingLength?: number; // todo: implement
}

/**
 * Handler for deailing with a node that is going to have a descendant replaced based on the range.
 */
export class RangeHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly helper: NodeHandlerHelper;
    private readonly start: number;
    private readonly end: number;
    // private readonly replacingLength: number | undefined;

    constructor(private readonly compilerFactory: CompilerFactory, opts: RangeHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.start = opts.start;
        this.end = opts.end;
        // this.replacingLength = opts.replacingLength;
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const currentSourceFile = currentNode._sourceFile.compilerNode;
        const children = this.helper.getChildrenFast(currentNode, newNode, newSourceFile);
        const currentNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(children[0]));
        const newNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(children[1]));

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && newNodeChildren.peek.getEnd() <= this.start)
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // go down into the children if before the node or in a surrounding node
        while (
            !currentNodeChildren.done && !newNodeChildren.done
            && (
                currentNodeChildren.peek.getStart(currentSourceFile) < this.start
                || currentNodeChildren.peek.getStart(currentSourceFile) === this.start && newNodeChildren.peek.end > this.end
            )
        ) {
            this.rangeHandlerReplace(currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);
        }

        // skip over the new children while they're within the range
        while (!newNodeChildren.done && newNodeChildren.peek.getEnd() <= this.end)
            newNodeChildren.next();

        // handle the rest
        while (!currentNodeChildren.done)
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private straightReplace(currentNode: ts.Node, nextNode: ts.Node, newSourceFile: ts.SourceFile) {
        this.helper.handleForValues(this.straightReplacementNodeHandler, currentNode, nextNode, newSourceFile);
    }

    private rangeHandlerReplace(currentNode: ts.Node, nextNode: ts.Node, newSourceFile: ts.SourceFile) {
        this.helper.handleForValues(this, currentNode, nextNode, newSourceFile);
    }
}
