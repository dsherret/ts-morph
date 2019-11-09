import { ts } from "@ts-morph/common";
import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

export interface DefaultParentHandlerOptions {
    childCount: number;
    isFirstChild: (currentNode: ts.Node, newNode: ts.Node) => boolean;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];
}

/**
 * Handler for deailing with a parent that is going to have a child replaced.
 */
export class DefaultParentHandler implements NodeHandler {
    private readonly straightReplacementNodeHandler: StraightReplacementNodeHandler;
    private readonly helper: NodeHandlerHelper;
    private readonly childCount: number;
    private readonly isFirstChild: (currentNode: ts.Node, newNode: ts.Node) => boolean;
    private readonly replacingNodes?: ts.Node[];
    private readonly customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];

    constructor(private readonly compilerFactory: CompilerFactory, opts: DefaultParentHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.childCount = opts.childCount;
        this.isFirstChild = opts.isFirstChild;
        this.replacingNodes = opts.replacingNodes?.map(n => n.compilerNode);
        this.customMappings = opts.customMappings;
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const [currentChildren, newChildren] = this.helper.getCompilerChildrenAsIterators(currentNode, newNode, newSourceFile);
        let count = this.childCount;

        // handle any custom mappings
        this.handleCustomMappings(newNode);

        // get the first child
        while (!currentChildren.done && !newChildren.done && !this.isFirstChild(currentChildren.peek, newChildren.peek))
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentChildren.next(), newChildren.next(), newSourceFile);

        // try replacing any nodes
        while (!currentChildren.done && this.tryReplaceNode(currentChildren.peek))
            currentChildren.next();

        // add or remove the items
        if (count > 0) {
            while (count > 0) {
                newChildren.next();
                count--;
            }
        }
        else if (count < 0) {
            while (count < 0) {
                this.helper.forgetNodeIfNecessary(currentChildren.next());
                count++;
            }
        }

        // handle the rest
        while (!currentChildren.done)
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentChildren.next(), newChildren.next(), newSourceFile);

        // ensure the new children iterator is done too
        if (!newChildren.done)
            throw new Error("Error replacing tree: Should not have children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private handleCustomMappings(newParentNode: ts.Node) {
        if (this.customMappings == null)
            return;
        const customMappings = this.customMappings(newParentNode);

        for (const mapping of customMappings)
            this.compilerFactory.replaceCompilerNode(mapping.currentNode, mapping.newNode);
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
