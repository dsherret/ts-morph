import { AbstractableNodeStructure, BodyableNodeStructure, DecoratableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface GetAccessorDeclarationStructure
    extends GetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure,
        ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure
{
}

export interface GetAccessorDeclarationSpecificStructure {
}
