import { removeInterfaceMember } from "../../manipulation";
import { CallSignatureDeclarationStructure, CallSignatureDeclarationSpecificStructure } from "../../structures";
import { ts } from "../../typescript";
import { ChildOrderableNode, JSDocableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const CallSignatureDeclarationBase = TypeParameteredNode(ChildOrderableNode(JSDocableNode(SignaturedDeclaration(TypeElement))));
export class CallSignatureDeclaration extends CallSignatureDeclarationBase<ts.CallSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<CallSignatureDeclarationStructure>) {
        callBaseFill(CallSignatureDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this call signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): CallSignatureDeclarationStructure {
        return callBaseGetStructure<CallSignatureDeclarationSpecificStructure>(CallSignatureDeclarationBase.prototype, this, {
        });
    }
}
