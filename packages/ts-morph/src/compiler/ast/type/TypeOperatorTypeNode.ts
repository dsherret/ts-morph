import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class TypeOperatorTypeNode extends TypeNode<ts.TypeOperatorNode> {
    /**
     * Gets the node within the type operator.
     */
    getTypeNode(): TypeNode {
        return this._getNodeFromCompilerNode(this.compilerNode.type);
    }
}
