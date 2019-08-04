import { AbstractableNodeStructure, DecoratableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { FunctionLikeDeclarationStructure } from "../function";

export interface SetAccessorDeclarationStructure
    extends Structure, SetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure,
        AbstractableNodeStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure
{
}

export interface SetAccessorDeclarationSpecificStructure extends KindedStructure<StructureKind.SetAccessor> {
}
