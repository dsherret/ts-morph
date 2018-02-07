import * as ts from "typescript";
import {TypeNode} from "./TypeNode";

export class TupleTypeNode extends TypeNode<ts.TupleTypeNode> {
    /**
     * Gets the tuple element type nodes.
     */
    getElementTypeNodes() {
        return this.compilerNode.elementTypes.map(t => this.getNodeFromCompilerNode<TypeNode>(t));
    }
}
