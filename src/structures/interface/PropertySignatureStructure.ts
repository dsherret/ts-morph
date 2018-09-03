import { InitializerExpressionableNodeStructure, JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, ReadonlyableNodeStructure,
    TypedNodeStructure } from "../base";

export interface PropertySignatureStructure extends PropertySignatureSpecificStructure, PropertyNamedNodeStructure,
    TypedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
    InitializerExpressionableNodeStructure {
}
export interface PropertySignatureSpecificStructure {
}
