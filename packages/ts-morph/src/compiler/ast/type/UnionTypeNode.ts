import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class UnionTypeNode extends TypeNode<ts.UnionTypeNode> {
    /**
     * Gets the union type nodes.
     */
    getTypeNodes(): TypeNode[] {
        return this.compilerNode.types.map(t => this._getNodeFromCompilerNode(t));
    }
}
