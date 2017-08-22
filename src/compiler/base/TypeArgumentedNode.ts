import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {Node} from "./../common";
import {TypeNode} from "./../type";

export type TypeArgumentedNodeExtensionType = Node<ts.Node & { typeArguments?: ts.NodeArray<ts.TypeNode>; }>;

export interface TypeArgumentedNode {
    /**
     * Gets all the type arguments of the node.
     */
    getTypeArguments(): TypeNode[];
}

export function TypeArgumentedNode<T extends Constructor<TypeArgumentedNodeExtensionType>>(Base: T): Constructor<TypeArgumentedNode> & T {
    return class extends Base implements TypeArgumentedNode {
        getTypeArguments() {
            if (this.compilerNode.typeArguments == null)
                return [];
            return this.compilerNode.typeArguments.map(a => this.global.compilerFactory.getTypeNode(a, this.sourceFile));
        }
    };
}
