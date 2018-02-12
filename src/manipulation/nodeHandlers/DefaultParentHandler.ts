import {AdvancedIterator, ArrayUtils} from "./../../utils";
import {ts} from "./../../typescript";
import {Node} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {StraightReplacementNodeHandler} from "./StraightReplacementNodeHandler";
import {NodeHandler} from "./NodeHandler";
import {NodeHandlerHelper} from "./NodeHandlerHelper";

export interface DefaultParentHandlerOptions {
    childCount: number;
    isFirstChild: (currentNode: ts.Node, newNode: Node) => boolean;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];
}

/**
 * Handler for deailing with a parent that is going to have a child replaced.
 */
export class DefaultParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly helper: NodeHandlerHelper;
    private readonly childCount: number;
    private readonly isFirstChild: (currentNode: ts.Node, newNode: Node) => boolean;
    private readonly replacingNodes?: ts.Node[];
    private readonly customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];

    constructor(private readonly compilerFactory: CompilerFactory, opts: DefaultParentHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.childCount = opts.childCount;
        this.isFirstChild = opts.isFirstChild;
        this.replacingNodes = opts.replacingNodes == null ? undefined : opts.replacingNodes.map(n => n.compilerNode);
        this.customMappings = opts.customMappings;
    }

    handleNode(currentNode: Node, newNode: Node) {
        const currentNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(currentNode.getCompilerChildren()));
        const newNodeChildren = new AdvancedIterator(newNode.getChildrenIterator());
        let count = this.childCount;

        // handle any custom mappings
        this.handleCustomMappings(newNode);

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && !this.isFirstChild(currentNodeChildren.peek, newNodeChildren.peek))
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNodeChildren.next(), newNodeChildren.next());

        // try replacing any nodes
        while (!currentNodeChildren.done && this.tryReplaceNode(currentNodeChildren.peek))
            currentNodeChildren.next();

        // add or remove the items
        if (count > 0) {
            while (count > 0) {
                newNodeChildren.next();
                count--;
            }
        }
        else if (count < 0) {
            while (count < 0) {
                this.helper.forgetNodeIfNecessary(currentNodeChildren.next());
                count++;
            }
        }

        // handle the rest
        while (!currentNodeChildren.done)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNodeChildren.next(), newNodeChildren.next());

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
            // now add the new node will be added to the cache
            currentNode.global.compilerFactory.replaceCompilerNode(currentNode, newCompilerNode);
        }
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
