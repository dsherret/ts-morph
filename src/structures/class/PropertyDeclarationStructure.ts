import {NamedStructure, TypedNodeStructure, QuestionTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, DocumentationableNodeStructure,
    ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure} from "./../base";

export interface PropertyDeclarationStructure
    extends NamedStructure, TypedNodeStructure, QuestionTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, DocumentationableNodeStructure,
        ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure
{
}
