import { BindingNamedNodeStructure, DecoratableNodeStructure, InitializerExpressionableNodeStructure, QuestionTokenableNodeStructure,
    ReadonlyableNodeStructure, ScopeableNodeStructure, TypedNodeStructure } from "../base";

export interface ParameterDeclarationStructure
    extends BindingNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure,
        ScopeableNodeStructure, InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure
{
}

export interface ParameterDeclarationSpecificStructure {
    isRestParameter?: boolean;
}
