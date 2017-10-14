import {AdvancedIterator} from "./../../utils";
import {NodeHandler} from "./NodeHandler";
import {Node} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {StraightReplacementNodeHandler} from "./StraightReplacementNodeHandler";

/**
 * Handler for deailing with a parent that is going to have a child replaced.
 */
export class DefaultParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly childCount: number;
    private readonly isFirstChild: (currentNode: Node, newNode: Node) => boolean;
    private readonly replacingNodes?: Node[];

    constructor(private readonly compilerFactory: CompilerFactory, opts: { childCount: number; isFirstChild: (currentNode: Node, newNode: Node) => boolean; replacingNodes?: Node[]; }) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.childCount = opts.childCount;
        this.isFirstChild = opts.isFirstChild;
        this.replacingNodes = opts.replacingNodes;
    }

    handleNode(currentNode: Node, newNode: Node) {
        const currentNodeChildren = new AdvancedIterator(currentNode.getChildrenIterator());
        const newNodeChildren = new AdvancedIterator(newNode.getChildrenIterator());
        let count = this.childCount;

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && !this.isFirstChild(currentNodeChildren.peek, newNodeChildren.peek))
            this.straightReplacementNodeHandler.handleNode(currentNodeChildren.next(), newNodeChildren.next());

        // try replacing any nodes
        while (!currentNodeChildren.done && this.tryReplaceNode(currentNodeChildren.peek))
            currentNodeChildren.next();

        // add or remove the items
        if (count > 0) {
            while (count > 0) {
                newNodeChildren.next().setSourceFile(currentNode.sourceFile);
                count--;
            }
        }
        else if (count < 0) {
            while (count < 0) {
                currentNodeChildren.next().dispose();
                count++;
            }
        }

        // handle the rest
        while (!currentNodeChildren.done) {
            this.straightReplacementNodeHandler.handleNode(currentNodeChildren.next(), newNodeChildren.next());
        }

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have more children left over."); // todo: better error message

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }

    private tryReplaceNode(currentNode: Node) {
        if (this.replacingNodes == null || this.replacingNodes.length === 0)
            return false;

        const index = this.replacingNodes.indexOf(currentNode);
        if (index === -1)
            return false;

        this.replacingNodes.splice(index, 1);
        currentNode.dispose();

        return true;
    }
}
