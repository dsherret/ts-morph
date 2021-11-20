import {
  JSDocableNodeStructure,
  PropertyNamedNodeStructure,
  QuestionTokenableNodeStructure,
  SignaturedDeclarationStructure,
  TypeParameteredNodeStructure,
} from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface MethodSignatureStructure
  extends
    Structure,
    PropertyNamedNodeStructure,
    MethodSignatureSpecificStructure,
    QuestionTokenableNodeStructure,
    JSDocableNodeStructure,
    SignaturedDeclarationStructure,
    TypeParameteredNodeStructure
{
}

export interface MethodSignatureSpecificStructure extends KindedStructure<StructureKind.MethodSignature> {
}
