import { removeInterfaceMember } from "../../manipulation";
import { MethodSignatureStructure, MethodSignatureSpecificStructure } from "../../structures";
import { ts } from "../../typescript";
import { ChildOrderableNode, JSDocableNode, PropertyNamedNode, QuestionTokenableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const MethodSignatureBase = ChildOrderableNode(JSDocableNode(QuestionTokenableNode(TypeParameteredNode(SignaturedDeclaration(PropertyNamedNode(TypeElement))))));
export class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<MethodSignatureStructure>) {
        callBaseFill(MethodSignatureBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this method signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): MethodSignatureStructure {
        return callBaseGetStructure<MethodSignatureSpecificStructure>(MethodSignatureBase.prototype, this, {
        });
    }
}
