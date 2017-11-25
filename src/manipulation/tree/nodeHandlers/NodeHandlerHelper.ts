import * as ts from "typescript";
import {Node} from "./../../../compiler";
import {CompilerFactory} from "./../../../factories";
import {AdvancedIterator} from "./../../../utils";
import {NodeHandler} from "./NodeHandler";

export class NodeHandlerHelper {
    constructor(private readonly compilerFactory: CompilerFactory) {
    }

    handleForValues(handler: NodeHandler, currentNode: ts.Node, newNode: Node) {
        if (this.compilerFactory.hasCompilerNode(currentNode))
            handler.handleNode(this.compilerFactory.getExistingCompilerNode(currentNode)!, newNode);
    }

    disposeNodeIfNecessary(currentNode: ts.Node) {
        if (this.compilerFactory.hasCompilerNode(currentNode))
            this.compilerFactory.getExistingCompilerNode(currentNode)!.dispose();
    }
}
