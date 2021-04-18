import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";
import { TypeParameterDeclaration } from "./TypeParameterDeclaration";

export class MappedTypeNode extends TypeNode<ts.MappedTypeNode> {

    /**
     * Gets the mapped type node's type name if any.
     */
    getNameTypeNode(): TypeNode | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.nameType);
    }

    /**
     * Gets the mapped type node's type parameter if any.
     */
    getTypeParameter(): TypeParameterDeclaration {
        return this._getNodeFromCompilerNode(this.compilerNode.typeParameter);
    }
}