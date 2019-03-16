import { AbstractableNodeStructure, DecoratableNodeStructure, ExclamationTokenableNodeStructure, InitializerExpressionableNodeStructure,
    JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, ReadonlyableNodeStructure, ScopedNodeStructure,
    StaticableNodeStructure, TypedNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface PropertyDeclarationStructure
    extends Structure<StructureKind.Property>, PropertyDeclarationSpecificStructure, PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure,
        ExclamationTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
        InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure
{
}

export interface PropertyDeclarationSpecificStructure {
}
