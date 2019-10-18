import { InitializerExpressionableNodeStructure, JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, ReadonlyableNodeStructure,
    TypedNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface PropertySignatureStructure
    extends Structure, PropertySignatureSpecificStructure, PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure,
        JSDocableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure
{
}

export interface PropertySignatureSpecificStructure extends KindedStructure<StructureKind.PropertySignature> {
}
