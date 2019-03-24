import { Node } from "../../compiler";
import { getCompilerChildren } from "../../compiler/ast/utils";
import { CompilerFactory } from "../../factories";
import { ts } from "../../typescript";
import { AdvancedIterator, ArrayUtils } from "../../utils";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

export interface RangeParentHandlerOptions {
    start: number;
    end: number;
    replacingLength?: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];
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
    private readonly customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];

    constructor(private readonly compilerFactory: CompilerFactory, opts: RangeParentHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.start = opts.start;
        this.end = opts.end;
        this.replacingLength = opts.replacingLength;
        this.replacingNodes = opts.replacingNodes == null ? undefined : opts.replacingNodes.map(n => n.compilerNode);
        this.customMappings = opts.customMappings;
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const currentSourceFile = currentNode._sourceFile.compilerNode;
        // todo: decide whether to use forEachChild or forEachKind here (might be hard with custom mappings)
        const currentNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(currentNode._getCompilerChildren()));
        const newNodeChildren = new AdvancedIterator(ArrayUtils.toIterator(getCompilerChildren(newNode, newSourceFile)));

        // handle any custom mappings
        this.handleCustomMappings(newNode);

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && newNodeChildren.peek.getStart(newSourceFile) < this.start)
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // handle the new nodes
        while (!newNodeChildren.done && newNodeChildren.peek.getStart(newSourceFile) >= this.start && newNodeChildren.peek.getEnd() <= this.end)
            newNodeChildren.next();

        // handle the nodes being replaced
        if (this.replacingLength != null) {
            const replacingEnd = this.start + this.replacingLength;
            while (!currentNodeChildren.done && (currentNodeChildren.peek.end <= replacingEnd || currentNodeChildren.peek.getStart(currentSourceFile) < replacingEnd))
                this.helper.forgetNodeIfNecessary(currentNodeChildren.next());
        }

        // handle the rest
        while (!currentNodeChildren.done)
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private handleCustomMappings(newParentNode: ts.Node) {
        if (this.customMappings == null)
            return;
        const customMappings = this.customMappings(newParentNode);

        for (const mapping of customMappings)
            mapping.currentNode._context.compilerFactory.replaceCompilerNode(mapping.currentNode, mapping.newNode);
    }

    private straightReplace(currentNode: ts.Node, nextNode: ts.Node, newSourceFile: ts.SourceFile) {
        if (!this.tryReplaceNode(currentNode))
            this.helper.handleForValues(this.straightReplacementNodeHandler, currentNode, nextNode, newSourceFile);
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
