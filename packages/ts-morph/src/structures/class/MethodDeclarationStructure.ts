import { AbstractableNodeStructure, AsyncableNodeStructure, DecoratableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure,
    OverrideableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure,
    StaticableNodeStructure, TypeParameteredNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "../function";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";

export interface MethodDeclarationStructure
    extends Structure, MethodDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure,
        AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure,
        QuestionTokenableNodeStructure, OverrideableNodeStructure
{
}

export interface MethodDeclarationSpecificStructure extends KindedStructure<StructureKind.Method> {
    overloads?: OptionalKind<MethodDeclarationOverloadStructure>[];
}

export interface MethodDeclarationOverloadStructure
    extends Structure, MethodDeclarationOverloadSpecificStructure, StaticableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure,
        AsyncableNodeStructure, GeneratorableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
        QuestionTokenableNodeStructure, OverrideableNodeStructure
{
}

export interface MethodDeclarationOverloadSpecificStructure extends KindedStructure<StructureKind.MethodOverload> {
}
