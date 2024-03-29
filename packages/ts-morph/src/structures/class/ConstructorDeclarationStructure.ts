import { JSDocableNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";

export interface ConstructorDeclarationStructure
  extends Structure, ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure
{
}

export interface ConstructorDeclarationSpecificStructure extends KindedStructure<StructureKind.Constructor> {
  overloads?: OptionalKind<ConstructorDeclarationOverloadStructure>[];
}

export interface ConstructorDeclarationOverloadStructure
  extends
    Structure,
    ConstructorDeclarationOverloadSpecificStructure,
    ScopedNodeStructure,
    SignaturedDeclarationStructure,
    TypeParameteredNodeStructure,
    JSDocableNodeStructure
{
}

export interface ConstructorDeclarationOverloadSpecificStructure extends KindedStructure<StructureKind.ConstructorOverload> {
}
