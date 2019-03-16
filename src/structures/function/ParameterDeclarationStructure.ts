import { BindingNamedNodeStructure, DecoratableNodeStructure, InitializerExpressionableNodeStructure, QuestionTokenableNodeStructure,
    ReadonlyableNodeStructure, ScopeableNodeStructure, TypedNodeStructure } from "../base";
import { Structure } from "../Structure";

export interface ParameterDeclarationStructure
    extends Structure, BindingNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure,
        ScopeableNodeStructure, InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure
{
}

export interface ParameterDeclarationSpecificStructure {
    isRestParameter?: boolean;
}
