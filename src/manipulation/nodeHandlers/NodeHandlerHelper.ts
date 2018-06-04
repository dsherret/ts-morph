import { SourceFile } from "../../compiler";
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
}
