import { ts } from "@ts-morph/common";
import { WriterFunction } from "../../../types";
import { TypeNode } from "./TypeNode";

export class ParenthesizedTypeNode extends TypeNode<ts.ParenthesizedTypeNode> {
    /**
     * Gets the node within the parentheses.
     */
    getTypeNode(): TypeNode {
        return this._getNodeFromCompilerNode(this.compilerNode.type);
    }

    /**
     * Sets the type within the parentheses.
     * @param textOrWriterFunction - Text or writer function to set the type with.
     */
    setType(textOrWriterFunction: string | WriterFunction) {
        this.getTypeNode().replaceWithText(textOrWriterFunction);
        return this;
    }
}
