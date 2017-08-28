import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {Node, Expression} from "./../common";

export type ArgumentedNodeExtensionType = Node<ts.Node & { arguments: ts.NodeArray<ts.Expression>; }>;

export interface ArgumentedNode {
    /**
     * Gets all the arguments of the node.
     */
    getArguments(): Expression[];
}

export function ArgumentedNode<T extends Constructor<ArgumentedNodeExtensionType>>(Base: T): Constructor<ArgumentedNode> & T {
    return class extends Base implements ArgumentedNode {
        getArguments() {
            return this.compilerNode.arguments.map(a => this.global.compilerFactory.getNodeFromCompilerNode(a, this.sourceFile)) as Expression[];
        }
    };
}
