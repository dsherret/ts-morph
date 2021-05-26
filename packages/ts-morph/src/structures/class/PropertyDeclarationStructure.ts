import { AbstractableNodeStructure, AmbientableNodeStructure, DecoratableNodeStructure, ExclamationTokenableNodeStructure,
    InitializerExpressionableNodeStructure, JSDocableNodeStructure, OverrideableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure,
    ReadonlyableNodeStructure, ScopedNodeStructure, StaticableNodeStructure, TypedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface PropertyDeclarationStructure
    extends Structure, PropertyDeclarationSpecificStructure, PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure,
        ExclamationTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
        InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, AmbientableNodeStructure, OverrideableNodeStructure
{
}

export interface PropertyDeclarationSpecificStructure extends KindedStructure<StructureKind.Property> {
}
