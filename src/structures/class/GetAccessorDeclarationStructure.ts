import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { AbstractableNodeStructure, BodyableNodeStructure, DecoratableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface GetAccessorDeclarationStructure
    extends Structure, GetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure,
        AbstractableNodeStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure
{
}

export interface GetAccessorDeclarationSpecificStructure extends KindedStructure<StructureKind.GetAccessor> {
}
