import { AbstractableNodeStructure, AsyncableNodeStructure, DecoratableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure,
    PropertyNamedNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, StaticableNodeStructure, TypeParameteredNodeStructure,
    QuestionTokenableNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { FunctionLikeDeclarationStructure } from "../function";
import { OptionalKind } from "../types";

export interface MethodDeclarationStructure
    extends Structure, MethodDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure,
        AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure,
        QuestionTokenableNodeStructure
{
}

export interface MethodDeclarationSpecificStructure extends KindedStructure<StructureKind.Method> {
    overloads?: OptionalKind<MethodDeclarationOverloadStructure>[];
}

export interface MethodDeclarationOverloadStructure
    extends Structure, MethodDeclarationOverloadSpecificStructure, StaticableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure,
        AsyncableNodeStructure, GeneratorableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
        QuestionTokenableNodeStructure
{
}

export interface MethodDeclarationOverloadSpecificStructure extends KindedStructure<StructureKind.MethodOverload> {
}
