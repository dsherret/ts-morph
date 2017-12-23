import {PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure,
    AsyncableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure, BodyableNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure, SignaturedDeclarationStructure} from "./../function";

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
        GeneratorableNodeStructure, SignaturedDeclarationStructure, JSDocableNodeStructure
{
}
