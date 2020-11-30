import { ts } from "@ts-morph/common";
import { MethodSignatureSpecificStructure, MethodSignatureStructure, StructureKind } from "../../../structures";
import { ChildOrderableNode, JSDocableNode, PropertyNamedNode, QuestionTokenableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { TypeElement } from "./TypeElement";

const createBase = <T extends typeof TypeElement>(ctor: T) =>
    ChildOrderableNode(JSDocableNode(QuestionTokenableNode(
        TypeParameteredNode(SignaturedDeclaration(PropertyNamedNode(ctor))),
    )));
export const MethodSignatureBase = createBase(TypeElement);
export class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
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
            kind: StructureKind.MethodSignature,
        });
    }
}
