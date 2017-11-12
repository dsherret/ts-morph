import {PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, DocumentationableNodeStructure,
    ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure} from "./../base";

export interface PropertyDeclarationStructure
    extends PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, DocumentationableNodeStructure,
        ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure
{
}
