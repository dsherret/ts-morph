import { StringUtils, ts } from "@ts-morph/common";
import { Node } from "../../compiler";
import { CompilerFactory } from "../../factories";
import { CharCodes } from "../../utils";
import { getPreviousMatchingPos } from "../textSeek";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";

export interface RangeParentHandlerOptions {
    start: number;
    end: number;
    replacingLength?: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: ts.Node, newSourceFile: ts.SourceFile) => { currentNode: Node; newNode: ts.Node; }[];
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
    private readonly customMappings?: (newParentNode: ts.Node, newSourceFile: ts.SourceFile) => { currentNode: Node; newNode: ts.Node; }[];

    constructor(private readonly compilerFactory: CompilerFactory, opts: RangeParentHandlerOptions) {
        this.straightReplacementNodeHandler = new StraightReplacementNodeHandler(compilerFactory);
        this.helper = new NodeHandlerHelper(compilerFactory);
        this.start = opts.start;
        this.end = opts.end;
        this.replacingLength = opts.replacingLength;
        this.replacingNodes = opts.replacingNodes?.map(n => n.compilerNode);
        this.customMappings = opts.customMappings;
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        // todo: decide whether to use forEachChild or forEachKind here (might be hard with custom mappings)
        const currentSourceFile = currentNode._sourceFile.compilerNode;
        const [currentNodeChildren, newNodeChildren] = this.helper.getCompilerChildrenAsIterators(currentNode, newNode, newSourceFile);

        // handle any custom mappings
        this.handleCustomMappings(newNode, newSourceFile);

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && newNodeChildren.peek.getStart(newSourceFile) < this.start)
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // handle the new nodes
        const newNodes: ts.Node[] = [];
        while (!newNodeChildren.done && newNodeChildren.peek.getStart(newSourceFile) >= this.start
            && getRealEnd(newNodeChildren.peek, newSourceFile) <= this.end)
        {
            newNodes.push(newNodeChildren.next());
        }

        // handle the nodes being replaced
        if (this.replacingLength != null) {
            const replacingEnd = this.start + this.replacingLength;
            const oldNodes: ts.Node[] = [];

            while (
                !currentNodeChildren.done
                && (getRealEnd(currentNodeChildren.peek, currentSourceFile) <= replacingEnd
                    || currentNodeChildren.peek.getStart(currentSourceFile) < replacingEnd)
            ) {
                oldNodes.push(currentNodeChildren.next());
            }

            // if the new node kinds and the old node kinds are the same, then don't forget the existing nodes
            if (oldNodes.length === newNodes.length && oldNodes.every((node, i) => node.kind === newNodes[i].kind)) {
                for (let i = 0; i < oldNodes.length; i++) {
                    const node = this.compilerFactory.getExistingNodeFromCompilerNode(oldNodes[i]);
                    if (node != null) {
                        node.forgetDescendants();
                        this.compilerFactory.replaceCompilerNode(oldNodes[i], newNodes[i]);
                    }
                }
            }
            else {
                oldNodes.forEach(node => this.helper.forgetNodeIfNecessary(node));
            }
        }

        // handle the rest
        while (!currentNodeChildren.done)
            this.straightReplace(currentNodeChildren.next(), newNodeChildren.next(), newSourceFile);

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private handleCustomMappings(newParentNode: ts.Node, newSourceFile: ts.SourceFile) {
        if (this.customMappings == null)
            return;
        const customMappings = this.customMappings(newParentNode, newSourceFile);

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

// this is sadly necessary due to TS issue #35455 where a JSDocTag node's end will not actually be the end
function getRealEnd(node: ts.Node, sourceFile: ts.SourceFile) {
    if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) {
        return getPreviousMatchingPos(
            sourceFile.text,
            node.end,
            charCode => charCode !== CharCodes.ASTERISK && !StringUtils.isWhitespaceCharCode(charCode),
        );
    }

    return node.end;
}
