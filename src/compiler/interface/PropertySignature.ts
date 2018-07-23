import { removeInterfaceMember } from "../../manipulation";
import { PropertySignatureStructure, PropertySignatureSpecificStructure } from "../../structures";
import { ts } from "../../typescript";
import {
    ChildOrderableNode, InitializerExpressionableNode, JSDocableNode, ModifierableNode, PropertyNamedNode,
    QuestionTokenableNode, ReadonlyableNode, TypedNode
} from "../base";
import { callBaseFill } from "../callBaseFill";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const PropertySignatureBase = ChildOrderableNode(JSDocableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(
    PropertyNamedNode(ModifierableNode(TypeElement))
))))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertySignatureStructure>): this {
        callBaseFill(PropertySignatureBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this property signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): PropertySignatureStructure {
        return callBaseGetStructure<PropertySignatureSpecificStructure>(PropertySignatureBase.prototype, this, {
        });
    }
}
