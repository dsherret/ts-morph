import {NamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure,
    AsyncableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure, BodiedNodeStructure, PropertyNamedNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure, SignaturedDeclarationStructure} from "./../function";

export interface GetAccessorDeclarationStructure
    extends GetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure,
        ScopedNodeStructure, FunctionLikeDeclarationStructure, BodiedNodeStructure
{
}

export interface GetAccessorDeclarationSpecificStructure {
}
