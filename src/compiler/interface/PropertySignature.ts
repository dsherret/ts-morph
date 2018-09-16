import { removeInterfaceMember } from "../../manipulation";
import { PropertySignatureStructure, PropertySignatureSpecificStructure } from "../../structures";
import { ts } from "../../typescript";
import { ChildOrderableNode, InitializerExpressionableNode, JSDocableNode, ModifierableNode, PropertyNamedNode,
    QuestionTokenableNode, ReadonlyableNode, TypedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const PropertySignatureBase = ChildOrderableNode(JSDocableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(
    PropertyNamedNode(ModifierableNode(TypeElement))
))))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
    /**
     * Removes this property signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<PropertySignatureStructure>) {
        callBaseSet(PropertySignatureBase.prototype, this, structure);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): PropertySignatureStructure {
        return callBaseGetStructure<PropertySignatureSpecificStructure>(PropertySignatureBase.prototype, this, {
        });
    }
}
