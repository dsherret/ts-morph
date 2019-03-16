import { AbstractableNodeStructure, BodyableNodeStructure, DecoratableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { FunctionLikeDeclarationStructure } from "../function";

export interface SetAccessorDeclarationStructure
    extends Structure<StructureKind.SetAccessor>, SetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure,
        AbstractableNodeStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure
{
}

export interface SetAccessorDeclarationSpecificStructure {
}
