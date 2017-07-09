import {ScopedNodeStructure, DocumentationableNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure, SignaturedDeclarationStructure} from "./../function";

export interface ConstructorDeclarationStructure extends ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure {
}

export interface ConstructorDeclarationSpecificStructure {
    overloads?: ConstructorDeclarationOverloadStructure[];
}

export interface ConstructorDeclarationOverloadStructure extends ScopedNodeStructure, SignaturedDeclarationStructure, DocumentationableNodeStructure {
}
