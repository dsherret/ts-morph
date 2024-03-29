import { ts } from "@ts-morph/common";
import { CallSignatureDeclarationSpecificStructure, CallSignatureDeclarationStructure, StructureKind } from "../../../structures";
import { ChildOrderableNode, JSDocableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { TypeElement } from "./TypeElement";

const createBase = <T extends typeof TypeElement>(ctor: T) =>
  TypeParameteredNode(ChildOrderableNode(JSDocableNode(
    SignaturedDeclaration(ctor),
  )));
export const CallSignatureDeclarationBase = createBase(TypeElement);
export class CallSignatureDeclaration extends CallSignatureDeclarationBase<ts.CallSignatureDeclaration> {
  /**
   * Sets the node from a structure.
   * @param structure - Structure to set the node with.
   */
  set(structure: Partial<CallSignatureDeclarationStructure>) {
    callBaseSet(CallSignatureDeclarationBase.prototype, this, structure);

    return this;
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): CallSignatureDeclarationStructure {
    return callBaseGetStructure<CallSignatureDeclarationSpecificStructure>(CallSignatureDeclarationBase.prototype, this, {
      kind: StructureKind.CallSignature,
    });
  }
}
