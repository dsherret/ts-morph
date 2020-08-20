import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class TupleTypeNode extends TypeNode<ts.TupleTypeNode> {
    /**
     * Gets the tuple element type nodes.
     */
    getElements() {
        return this.compilerNode.elements.map(t => this._getNodeFromCompilerNode(t));
    }
}
