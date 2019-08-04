import { BindingNamedNodeStructure, DecoratableNodeStructure, InitializerExpressionableNodeStructure, QuestionTokenableNodeStructure,
    ReadonlyableNodeStructure, ScopeableNodeStructure, TypedNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ParameterDeclarationStructure
    extends Structure, BindingNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure,
        ScopeableNodeStructure, InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure
{
}

export interface ParameterDeclarationSpecificStructure extends KindedStructure<StructureKind.Parameter> {
    isRestParameter?: boolean;
}
