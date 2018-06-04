import { AbstractableNodeStructure, BodiedNodeStructure, DecoratableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface SetAccessorDeclarationStructure
    extends SetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure,
        ScopedNodeStructure, FunctionLikeDeclarationStructure, BodiedNodeStructure
{
}

export interface SetAccessorDeclarationSpecificStructure {
}
