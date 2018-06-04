import { removeInterfaceMember } from "../../manipulation";
import { PropertySignatureStructure } from "../../structures";
import { ts } from "../../typescript";
import { ChildOrderableNode, InitializerExpressionableNode, JSDocableNode, ModifierableNode, PropertyNamedNode, QuestionTokenableNode, ReadonlyableNode, TypedNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { TypeElement } from "./TypeElement";

export const PropertySignatureBase = ChildOrderableNode(JSDocableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(
    PropertyNamedNode(ModifierableNode(TypeElement))
))))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertySignatureStructure>) {
        callBaseFill(PropertySignatureBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this property signature.
     */
    remove() {
        removeInterfaceMember(this);
    }
}
