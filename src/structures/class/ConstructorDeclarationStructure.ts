import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { BodyableNodeStructure, JSDocableNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";

export interface ConstructorDeclarationStructure extends Structure, ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure {
}

export interface ConstructorDeclarationSpecificStructure extends KindedStructure<StructureKind.Constructor> {
    overloads?: ConstructorDeclarationOverloadStructure[];
}

export interface ConstructorDeclarationOverloadStructure
    extends Structure, ScopedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure
{
}
