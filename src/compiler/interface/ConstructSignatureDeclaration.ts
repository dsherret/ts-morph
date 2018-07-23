import { removeInterfaceMember } from "../../manipulation";
import { ConstructSignatureDeclarationStructure } from "../../structures";
import { ts } from "../../typescript";
import { ChildOrderableNode, JSDocableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const ConstructSignatureDeclarationBase = TypeParameteredNode(ChildOrderableNode(JSDocableNode(SignaturedDeclaration(TypeElement))));
export class ConstructSignatureDeclaration extends ConstructSignatureDeclarationBase<ts.ConstructSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ConstructSignatureDeclarationStructure>) {
        callBaseFill(ConstructSignatureDeclarationBase.prototype, this, structure);

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
        return callBaseGetStructure<ConstructSignatureDeclarationStructure>(ConstructSignatureDeclarationBase.prototype, this, {
            docs: this.getJsDocs().map(doc => doc.getStructure()),
            parameters: this.getParameters().map(param => param.getStructure()),
            returnType: this.getReturnType().getText(),
            typeParameters: this.getTypeParameters().map(param => param.getStructure())
        }) as ConstructSignatureDeclarationStructure;
    }
}
