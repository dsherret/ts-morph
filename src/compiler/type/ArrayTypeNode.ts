import { ts } from "../../typescript";
import { TypeNode } from "./TypeNode";

export class ArrayTypeNode extends TypeNode<ts.ArrayTypeNode> {
    /**
     * Gets the array type node's element type node.
     */
    getElementTypeNode(): TypeNode {
        return this.getNodeFromCompilerNode(this.compilerNode.elementType);
    }
}
