import {DeclarationNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure, ScopeableNodeStructure,
    InitializerExpressionableNodeStructure} from "./../base";

export interface ParameterDeclarationStructure
    extends DeclarationNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure, ScopeableNodeStructure,
        InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure
{
}

export interface ParameterDeclarationSpecificStructure {
    isRestParameter?: boolean;
}
