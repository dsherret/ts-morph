﻿import { DeclarationNamedNodeStructure, DecoratableNodeStructure, InitializerExpressionableNodeStructure, QuestionTokenableNodeStructure,
    ReadonlyableNodeStructure, ScopeableNodeStructure, TypedNodeStructure } from "../base";

export interface ParameterDeclarationStructure
    extends DeclarationNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure, ScopeableNodeStructure,
        InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure
{
    name: string;
}

export interface ParameterDeclarationSpecificStructure {
    isRestParameter?: boolean;
}
