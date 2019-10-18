import { ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

export class InferTypeNode extends TypeNode<ts.InferTypeNode> {
    /**
     * Gets the infer type node's type parameter.
     *
     * Ex. In `infer R` returns `R`.
     */
    getTypeParameter() {
        return this._getNodeFromCompilerNode(this.compilerNode.typeParameter);
    }
}
