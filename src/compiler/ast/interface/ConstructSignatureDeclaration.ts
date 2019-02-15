import { removeInterfaceMember } from "../../../manipulation";
import { ConstructSignatureDeclarationStructure, ConstructSignatureDeclarationSpecificStructure } from "../../../structures";
import { ts } from "../../../typescript";
import { ChildOrderableNode, JSDocableNode, SignatureDeclaration, TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const ConstructSignatureDeclarationBase = TypeParameteredNode(ChildOrderableNode(JSDocableNode(SignatureDeclaration(TypeElement))));
export class ConstructSignatureDeclaration extends ConstructSignatureDeclarationBase<ts.ConstructSignatureDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ConstructSignatureDeclarationStructure>) {
        callBaseSet(ConstructSignatureDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this construct signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ConstructSignatureDeclarationStructure {
        return callBaseGetStructure<ConstructSignatureDeclarationSpecificStructure>(ConstructSignatureDeclarationBase.prototype, this, {
        }) as ConstructSignatureDeclarationStructure;
    }
}
