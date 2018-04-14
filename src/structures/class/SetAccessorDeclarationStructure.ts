import { NamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure,
    AsyncableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure, BodiedNodeStructure, PropertyNamedNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface SetAccessorDeclarationStructure
    extends SetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure,
        ScopedNodeStructure, FunctionLikeDeclarationStructure, BodiedNodeStructure
{
}

export interface SetAccessorDeclarationSpecificStructure {
}
