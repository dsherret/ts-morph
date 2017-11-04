import {AdvancedIterator} from "./../../../utils";
import {Node} from "./../../../compiler";
import {CompilerFactory} from "./../../../factories";
import {StraightReplacementNodeHandler} from "./StraightReplacementNodeHandler";
import {NodeHandler} from "./NodeHandler";

/**
 * Handler for deailing with a parent that is going to have a child replaced based on the range.
 */
export class RangeParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly start: number;
    private readonly end: number;

    constructor(private readonly compilerFactory: CompilerFactory, opts: { start: number; end: number; }) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.start = opts.start;
        this.end = opts.end;
    }

    handleNode(currentNode: Node, newNode: Node) {
        const currentNodeChildren = new AdvancedIterator(currentNode.getChildrenIterator());
        const newNodeChildren = new AdvancedIterator(newNode.getChildrenIterator());

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && newNodeChildren.peek.getStart() < this.start)
            this.straightReplacementNodeHandler.handleNode(currentNodeChildren.next(), newNodeChildren.next());

        // handle the new nodes
        while (!newNodeChildren.done && newNodeChildren.peek.getStart() >= this.start && newNodeChildren.peek.getEnd() <= this.end)
            newNodeChildren.next().setSourceFile(currentNode.sourceFile);

        // handle the rest
        while (!currentNodeChildren.done)
            this.straightReplacementNodeHandler.handleNode(currentNodeChildren.next(), newNodeChildren.next());

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have more children left over."); // todo: better error message

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
