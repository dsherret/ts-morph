import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class IndexedAccessTypeNode extends TypeNode<ts.IndexedAccessTypeNode> {
    /**
     * Gets the indexed access type node's object type node.
     *
     * This is `MyObjectType` in `MyObjectType["myIndex"]`.
     */
    getObjectTypeNode(): TypeNode {
        return this._getNodeFromCompilerNode(this.compilerNode.objectType);
    }

    /**
     * Gets the indexed access type node's index type node.
     *
     * This is `"myIndex"` in `MyObjectType["myIndex"]`.
     */
    getIndexTypeNode(): TypeNode {
        return this._getNodeFromCompilerNode(this.compilerNode.indexType);
    }
}
