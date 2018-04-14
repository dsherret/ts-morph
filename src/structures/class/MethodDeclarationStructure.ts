import { PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure,
    AsyncableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure, BodyableNodeStructure, SignaturedDeclarationStructure,
    TypeParameteredNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface MethodDeclarationStructure
    extends MethodDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure,
        ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure
{
}

export interface MethodDeclarationSpecificStructure {
    overloads?: MethodDeclarationOverloadStructure[];
}

export interface MethodDeclarationOverloadStructure
    extends StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure
{
}
