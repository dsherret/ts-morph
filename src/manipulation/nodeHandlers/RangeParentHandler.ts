import {AdvancedIterator, ArrayUtils} from "./../../utils";
import {Node} from "./../../compiler";
import {ts, SyntaxKind} from "./../../typescript";
import {CompilerFactory} from "./../../factories";
import {StraightReplacementNodeHandler} from "./StraightReplacementNodeHandler";
import {NodeHandler} from "./NodeHandler";
import {NodeHandlerHelper} from "./NodeHandlerHelper";

export interface RangeParentHandlerOptions {
    start: number;
    end: number;
    replacingLength?: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];
}

/**
 * Handler for deailing with a parent that is going to have a child replaced based on the range.
 */
export class RangeParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly helper: NodeHandlerHelper;
    private readonly start: number;
    private readonly end: number;
    private readonly replacingLength: number | undefined;
    private readonly replacingNodes: ts.Node[] | undefined;
    private readonly customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];

    constructor(private readonly compilerFactory: CompilerFactory, opts: RangeParentHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.start = opts.start;
        this.end = opts.end;
        this.replacingLength = opts.replacingLength;
        this.replacingNodes = opts.replacingNodes == null ? undefined : opts.replacingNodes.map(n => n.compilerNode);
        this.customMappings = opts.customMappings;
    }

    handleNode(currentNode: Node, newNode: Node) {
        const currentNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(currentNode.getCompilerChildren()));
        const newNodeChildren = new AdvancedIterator(newNode.getChildrenIterator());

        // handle any custom mappings
        this.handleCustomMappings(newNode);

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && newNodeChildren.peek.getStart() < this.start)
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next());

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
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next());

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have more children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }

    private handleCustomMappings(newParentNode: Node) {
        if (this.customMappings == null)
            return;
        const customMappings = this.customMappings(newParentNode);

        for (const mapping of customMappings) {
            const {currentNode, newNode} = mapping;
            const newCompilerNode = newNode.compilerNode;
            // forget before replacing so that the node is removed from the cache
            newNode.forget();
            // now add the new node to be added to the cache
            currentNode.global.compilerFactory.replaceCompilerNode(currentNode, newCompilerNode);
        }
    }

    private straightReplace(currentNode: ts.Node, nextNode: Node) {
        if (!this.tryReplaceNode(currentNode))
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNode, nextNode);
    }

    private tryReplaceNode(currentCompilerNode: ts.Node) {
        if (this.replacingNodes == null || this.replacingNodes.length === 0)
            return false;
        const index = this.replacingNodes.indexOf(currentCompilerNode);

        if (index === -1)
            return false;

        this.replacingNodes.splice(index, 1);
        this.helper.forgetNodeIfNecessary(currentCompilerNode);

        return true;
    }
}
