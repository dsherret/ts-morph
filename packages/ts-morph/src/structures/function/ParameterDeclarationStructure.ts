import { BindingNamedNodeStructure, DecoratableNodeStructure, InitializerExpressionableNodeStructure, OverrideableNodeStructure, QuestionTokenableNodeStructure,
    ReadonlyableNodeStructure, ScopeableNodeStructure, TypedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ParameterDeclarationStructure
    extends Structure, BindingNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure,
        ScopeableNodeStructure, InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure, OverrideableNodeStructure
{
}

export interface ParameterDeclarationSpecificStructure extends KindedStructure<StructureKind.Parameter> {
    isRestParameter?: boolean;
}
