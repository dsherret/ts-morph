import {AdvancedIterator, ArrayUtils} from "./../../utils";
import {Node} from "./../../compiler";
import {SyntaxKind} from "./../../typescript";
import {CompilerFactory} from "./../../factories";
import {StraightReplacementNodeHandler} from "./StraightReplacementNodeHandler";
import {NodeHandler} from "./NodeHandler";
import {NodeHandlerHelper} from "./NodeHandlerHelper";

/**
 * Handler for deailing with a parent that is going to have a child replaced based on the range.
 */
export class RangeParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly helper: NodeHandlerHelper;
    private readonly start: number;
    private readonly end: number;
    private readonly replacingLength: number | undefined;

    constructor(private readonly compilerFactory: CompilerFactory, opts: { start: number; end: number; replacingLength?: number; }) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.start = opts.start;
        this.end = opts.end;
        this.replacingLength = opts.replacingLength;
    }

    handleNode(currentNode: Node, newNode: Node) {
        const currentNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(currentNode.getCompilerChildren()));
        const newNodeChildren = new AdvancedIterator(newNode.getChildrenIterator());

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && newNodeChildren.peek.getStart() < this.start)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNodeChildren.next(), newNodeChildren.next());

        // handle the new nodes
        while (!newNodeChildren.done && newNodeChildren.peek.getStart() >= this.start && newNodeChildren.peek.getEnd() <= this.end)
            newNodeChildren.next();

        // handle the nodes being replaced
        if (this.replacingLength != null) {
            const replacingEnd = this.start + this.replacingLength;
            while (!currentNodeChildren.done && (currentNodeChildren.peek.end <= replacingEnd || currentNodeChildren.peek.getStart() < replacingEnd))
                this.helper.forgetNodeIfNecessary(currentNodeChildren.next());
        }

        // handle the rest
        while (!currentNodeChildren.done)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNodeChildren.next(), newNodeChildren.next());

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have more children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
