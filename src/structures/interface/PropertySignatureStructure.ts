import { InitializerExpressionableNodeStructure, JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, ReadonlyableNodeStructure,
    TypedNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface PropertySignatureStructure
    extends Structure<StructureKind.PropertySignature>, PropertySignatureSpecificStructure, PropertyNamedNodeStructure, TypedNodeStructure,
        QuestionTokenableNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure
{
}

export interface PropertySignatureSpecificStructure {
}
