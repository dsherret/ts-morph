import { AbstractableNodeStructure, DecoratableNodeStructure, ExclamationTokenableNodeStructure, InitializerExpressionableNodeStructure,
    JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, ReadonlyableNodeStructure, ScopedNodeStructure,
    StaticableNodeStructure, TypedNodeStructure } from "../base";

export interface PropertyDeclarationStructure
    extends PropertyDeclarationSpecificStructure, PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure,
        ExclamationTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
        InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure
{
}

export interface PropertyDeclarationSpecificStructure {
}
