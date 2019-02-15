import { BodyableNodeStructure, JSDocableNodeStructure, ScopedNodeStructure, SignatureDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface ConstructorDeclarationStructure
    extends ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure
{
}

export interface ConstructorDeclarationSpecificStructure {
    overloads?: ConstructorDeclarationOverloadStructure[];
}

export interface ConstructorDeclarationOverloadStructure extends ScopedNodeStructure, SignatureDeclarationStructure, TypeParameteredNodeStructure,
    JSDocableNodeStructure {
}
