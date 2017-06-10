import {NamedStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure, ScopeableNodeStructure,
    InitializerExpressionableNodeStructure} from "./../base";

export interface ParameterDeclarationStructure
    extends NamedStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure, ScopeableNodeStructure,
        InitializerExpressionableNodeStructure
{
    isRestParameter?: boolean;
}
