import { Node, SourceFile } from "../../compiler";
import { getCompilerChildren, getCompilerForEachChildren } from "../../compiler/ast/utils";
import { CompilerFactory } from "../../factories";
import { SyntaxKind, ts } from "../../typescript";
import { NodeHandler } from "./NodeHandler";

export class NodeHandlerHelper {
    constructor(private readonly compilerFactory: CompilerFactory) {
    }

    handleForValues(handler: NodeHandler, currentNode: ts.Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        if (this.compilerFactory.hasCompilerNode(currentNode))
            handler.handleNode(this.compilerFactory.getExistingCompilerNode(currentNode)!, newNode, newSourceFile);
        else if (currentNode.kind === SyntaxKind.SyntaxList) {
            // always handle syntax lists because their children might be in the cache
            // todo: pass this in for performance reasons
            const sourceFile = this.compilerFactory.getExistingCompilerNode(currentNode.getSourceFile())! as SourceFile;
            handler.handleNode(this.compilerFactory.getNodeFromCompilerNode(currentNode, sourceFile), newNode, newSourceFile);
        }
    }

    forgetNodeIfNecessary(currentNode: ts.Node) {
        if (this.compilerFactory.hasCompilerNode(currentNode))
            this.compilerFactory.getExistingCompilerNode(currentNode)!.forget();
    }

    /**
     * Gets the children of the node according to whether the tokens have previously been parsed.
     */
    getChildrenFast(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile): [ts.Node[], ts.Node[]] {
        if (currentNode._hasParsedTokens())
            return [currentNode._getCompilerChildren(), getCompilerChildren(newNode, newSourceFile)];

        // great, we don't have to parse the tokens and can instead just use ts.forEachChild (faster)
        return [currentNode._getCompilerForEachChildren(), getCompilerForEachChildren(newNode, newSourceFile)];
    }
}
