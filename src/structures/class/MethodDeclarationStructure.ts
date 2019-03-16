import { AbstractableNodeStructure, AsyncableNodeStructure, BodyableNodeStructure, DecoratableNodeStructure, GeneratorableNodeStructure,
    JSDocableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, StaticableNodeStructure,
    TypeParameteredNodeStructure, QuestionTokenableNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { FunctionLikeDeclarationStructure } from "../function";

export interface MethodDeclarationStructure
    extends Structure, MethodDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure,
        AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure,
        QuestionTokenableNodeStructure
{
}

export interface MethodDeclarationSpecificStructure extends KindedStructure<StructureKind.Method> {
    overloads?: MethodDeclarationOverloadStructure[];
}

export interface MethodDeclarationOverloadStructure
    extends Structure, StaticableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
        QuestionTokenableNodeStructure
{
}
