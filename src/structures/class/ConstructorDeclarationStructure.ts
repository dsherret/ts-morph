import {ScopedNodeStructure, JSDocableNodeStructure, BodyableNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure, SignaturedDeclarationStructure} from "./../function";

export interface ConstructorDeclarationStructure
    extends ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure
{
}

export interface ConstructorDeclarationSpecificStructure {
    overloads?: ConstructorDeclarationOverloadStructure[];
}

export interface ConstructorDeclarationOverloadStructure extends ScopedNodeStructure, SignaturedDeclarationStructure, JSDocableNodeStructure {
}
