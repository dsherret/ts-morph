import { PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
    InitializerExpressionableNodeStructure } from "../base";

export interface PropertySignatureStructure
    extends PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
        InitializerExpressionableNodeStructure
{
}
