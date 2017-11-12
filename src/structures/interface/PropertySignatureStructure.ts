import {PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure, ReadonlyableNodeStructure,
    InitializerExpressionableNodeStructure} from "./../base";

export interface PropertySignatureStructure
    extends PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure, ReadonlyableNodeStructure,
        InitializerExpressionableNodeStructure
{
}
