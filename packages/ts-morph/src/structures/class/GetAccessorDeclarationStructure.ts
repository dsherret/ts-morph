import { AbstractableNodeStructure, DecoratableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface GetAccessorDeclarationStructure
  extends
    Structure,
    GetAccessorDeclarationSpecificStructure,
    PropertyNamedNodeStructure,
    StaticableNodeStructure,
    DecoratableNodeStructure,
    AbstractableNodeStructure,
    ScopedNodeStructure,
    FunctionLikeDeclarationStructure
{
}

export interface GetAccessorDeclarationSpecificStructure extends KindedStructure<StructureKind.GetAccessor> {
}
