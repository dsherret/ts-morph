import { ArrayUtils, SyntaxKind, ts } from "@ts-morph/common";
import { Node, SourceFile } from "../../compiler";
import { ExtendedParser, hasParsedTokens } from "../../compiler/ast/utils";
import { CompilerFactory } from "../../factories";
import { AdvancedIterator } from "../../utils";
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

    getCompilerChildrenAsIterators(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile): [AdvancedIterator<ts.Node>, AdvancedIterator<ts.Node>] {
        const children = this.getCompilerChildren(currentNode, newNode, newSourceFile);
        return [
            new AdvancedIterator(ArrayUtils.toIterator(children[0])),
            new AdvancedIterator(ArrayUtils.toIterator(children[1]))
        ];
    }

    getCompilerChildren(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile): [ts.Node[], ts.Node[]] {
        const currentCompilerNode = currentNode.compilerNode;
        const currentSourceFile = currentNode._sourceFile.compilerNode;

        return [
            ExtendedParser.getCompilerChildren(currentCompilerNode, currentSourceFile),
            ExtendedParser.getCompilerChildren(newNode, newSourceFile)
        ];
    }

    /**
     * Gets the children of the node according to whether the tokens have previously been parsed.
     */
    getChildrenFast(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile): [ts.Node[], ts.Node[]] {
        const currentCompilerNode = currentNode.compilerNode;
        const currentSourceFile = currentNode._sourceFile.compilerNode;
        if (hasParsedTokens(currentCompilerNode)) {
            return [
                ExtendedParser.getCompilerChildren(currentCompilerNode, currentSourceFile),
                ExtendedParser.getCompilerChildren(newNode, newSourceFile)
            ];
        }

        // great, we don't have to parse the tokens and can instead just use ts.forEachChild (faster)
        return [
            ExtendedParser.getCompilerForEachChildren(currentCompilerNode, currentSourceFile),
            ExtendedParser.getCompilerForEachChildren(newNode, newSourceFile)
        ];
    }
}
