import { ts } from "@ts-morph/common";
import { ConstructSignatureDeclarationStructure, ConstructSignatureDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { ChildOrderableNode, JSDocableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { TypeElement } from "./TypeElement";
import { callBaseGetStructure } from "../callBaseGetStructure";

const createBase = <T extends typeof TypeElement>(ctor: T) => TypeParameteredNode(ChildOrderableNode(
    JSDocableNode(SignaturedDeclaration(ctor))
));
export const ConstructSignatureDeclarationBase = createBase(TypeElement);
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
     * Gets the structure equivalent to this node.
     */
    getStructure(): ConstructSignatureDeclarationStructure {
        return callBaseGetStructure<ConstructSignatureDeclarationSpecificStructure>(ConstructSignatureDeclarationBase.prototype, this, {
            kind: StructureKind.ConstructSignature
        }) as ConstructSignatureDeclarationStructure;
    }
}
