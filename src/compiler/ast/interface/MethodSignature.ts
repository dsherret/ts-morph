import { removeInterfaceMember } from "../../../manipulation";
import { MethodSignatureStructure, MethodSignatureSpecificStructure, StructureKind } from "../../../structures";
import { ts } from "../../../typescript";
import { ChildOrderableNode, JSDocableNode, PropertyNamedNode, QuestionTokenableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const MethodSignatureBase = ChildOrderableNode(JSDocableNode(QuestionTokenableNode(TypeParameteredNode(SignaturedDeclaration(PropertyNamedNode(TypeElement))))));
export class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
    /**
     * Removes this method signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<MethodSignatureStructure>) {
        callBaseSet(MethodSignatureBase.prototype, this, structure);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): MethodSignatureStructure {
        return callBaseGetStructure<MethodSignatureSpecificStructure>(MethodSignatureBase.prototype, this, {
            kind: StructureKind.MethodSignature
        });
    }
}
