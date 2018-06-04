import { removeInterfaceMember } from "../../manipulation";
import { MethodSignatureStructure } from "../../structures";
import { ts } from "../../typescript";
import { ChildOrderableNode, JSDocableNode, PropertyNamedNode, QuestionTokenableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { TypeElement } from "./TypeElement";

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
}
