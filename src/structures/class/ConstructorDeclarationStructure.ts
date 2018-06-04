import { BodyableNodeStructure, JSDocableNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface ConstructorDeclarationStructure
    extends ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure
{
}

export interface ConstructorDeclarationSpecificStructure {
    overloads?: ConstructorDeclarationOverloadStructure[];
}

export interface ConstructorDeclarationOverloadStructure extends ScopedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure,
    JSDocableNodeStructure {
}
