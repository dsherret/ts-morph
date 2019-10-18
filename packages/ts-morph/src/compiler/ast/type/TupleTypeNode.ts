import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class TupleTypeNode extends TypeNode<ts.TupleTypeNode> {
    /**
     * Gets the tuple element type nodes.
     */
    getElementTypeNodes(): TypeNode[] {
        return this.compilerNode.elementTypes.map(t => this._getNodeFromCompilerNode(t));
    }
}
