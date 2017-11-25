import * as ts from "typescript";
import {Node, SourceFile} from "./../../../compiler";
import {CompilerFactory} from "./../../../factories";
import {AdvancedIterator} from "./../../../utils";
import {NodeHandler} from "./NodeHandler";

export class NodeHandlerHelper {
    constructor(private readonly compilerFactory: CompilerFactory) {
    }

    handleForValues(handler: NodeHandler, currentNode: ts.Node, newNode: Node) {
        if (this.compilerFactory.hasCompilerNode(currentNode))
            handler.handleNode(this.compilerFactory.getExistingCompilerNode(currentNode)!, newNode);
        else if (currentNode.kind === ts.SyntaxKind.SyntaxList) {
            // always handle syntax lists because their children might be in the cache
            // todo: pass this in for performance reasons
            const sourceFile = this.compilerFactory.getExistingCompilerNode(currentNode.getSourceFile())! as SourceFile;
            handler.handleNode(this.compilerFactory.getNodeFromCompilerNode(currentNode, sourceFile), newNode);
        }
    }

    forgetNodeIfNecessary(currentNode: ts.Node) {
        if (this.compilerFactory.hasCompilerNode(currentNode))
            this.compilerFactory.getExistingCompilerNode(currentNode)!.forget();
    }
}
