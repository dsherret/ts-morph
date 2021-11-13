import { AbstractableNodeStructure, DecoratableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface SetAccessorDeclarationStructure
  extends
    Structure,
    SetAccessorDeclarationSpecificStructure,
    PropertyNamedNodeStructure,
    StaticableNodeStructure,
    DecoratableNodeStructure,
    AbstractableNodeStructure,
    ScopedNodeStructure,
    FunctionLikeDeclarationStructure
{
}

export interface SetAccessorDeclarationSpecificStructure extends KindedStructure<StructureKind.SetAccessor> {
}
