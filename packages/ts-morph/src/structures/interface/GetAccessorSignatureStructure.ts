import { StructureKind } from "../StructureKind";
import { JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, ReturnTypedNodeStructure, TypeParameteredNodeStructure, TypedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";

export interface GetAccessorSignatureStructure
  extends
    Structure,
    GetAccessorSignatureSpecificStructure,
    PropertyNamedNodeStructure,
    TypeParameteredNodeStructure,
    ReturnTypedNodeStructure,
    QuestionTokenableNodeStructure,
    JSDocableNodeStructure
{
}

export interface GetAccessorSignatureSpecificStructure extends KindedStructure<StructureKind.GetAccessorSignature> {
}