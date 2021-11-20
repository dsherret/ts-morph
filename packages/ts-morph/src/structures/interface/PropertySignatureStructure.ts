import {
  InitializerExpressionableNodeStructure,
  JSDocableNodeStructure,
  PropertyNamedNodeStructure,
  QuestionTokenableNodeStructure,
  ReadonlyableNodeStructure,
  TypedNodeStructure,
} from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface PropertySignatureStructure
  extends
    Structure,
    PropertySignatureSpecificStructure,
    PropertyNamedNodeStructure,
    TypedNodeStructure,
    QuestionTokenableNodeStructure,
    JSDocableNodeStructure,
    ReadonlyableNodeStructure,
    InitializerExpressionableNodeStructure
{
}

export interface PropertySignatureSpecificStructure extends KindedStructure<StructureKind.PropertySignature> {
}
