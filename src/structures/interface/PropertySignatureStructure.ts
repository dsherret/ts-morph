import {NamedStructure, TypedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure, ReadonlyableNodeStructure,
    InitializerExpressionableNodeStructure} from "./../base";

export interface PropertySignatureStructure
    extends NamedStructure, TypedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure
{
}
