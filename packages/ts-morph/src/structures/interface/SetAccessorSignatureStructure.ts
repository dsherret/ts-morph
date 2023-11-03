import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";
import { JSDocableNodeStructure, ParameteredNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, TypeParameteredNodeStructure, TypedNodeStructure } from "../base";

export interface SetAccessorSignatureStructure
  extends
    Structure,
    SetAccessorSignatureSpecificStructure,
    PropertyNamedNodeStructure,
    TypeParameteredNodeStructure,
    ParameteredNodeStructure,
    QuestionTokenableNodeStructure,
    JSDocableNodeStructure
{
}

export interface SetAccessorSignatureSpecificStructure extends KindedStructure<StructureKind.SetAccessorSignature> {
}
