import { Node } from "../../compiler";
import { errors, getSyntaxKindName, ts } from "@ts-morph/common";
import { CompilerFactory } from "../../factories";
import { NodeHandler } from "./NodeHandler";
import { NodeHandlerHelper } from "./NodeHandlerHelper";

/**
 * Replacement handler for replacing parts of the tree that should be equal.
 */
export class StraightReplacementNodeHandler implements NodeHandler {
    protected readonly helper: NodeHandlerHelper;

    constructor(protected readonly compilerFactory: CompilerFactory) {
        this.helper = new NodeHandlerHelper(compilerFactory);
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.kind) {
            throw new errors.InvalidOperationError(`Error replacing tree! Perhaps a syntax error was inserted `
                + `(Current: ${currentNode.getKindName()} -- New: ${getSyntaxKindName(newNode.kind)}).`);
        }

        if (currentNode._hasWrappedChildren())
            this.handleChildren(currentNode, newNode, newSourceFile);

        this.compilerFactory.replaceCompilerNode(currentNode, newNode);
    }

    private handleChildren(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        const [currentChildren, newChildren] = this.helper.getChildrenFast(currentNode, newNode, newSourceFile);

        if (currentChildren.length !== newChildren.length) {
            throw new Error(
                `Error replacing tree: The children of the old and new trees were expected to have the `
                    + `same count (${currentChildren.length}:${newChildren.length}).`
            );
        }

        for (let i = 0; i < currentChildren.length; i++)
            this.helper.handleForValues(this, currentChildren[i], newChildren[i], newSourceFile);
    }
}
