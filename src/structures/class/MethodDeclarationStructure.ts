import { AbstractableNodeStructure, AsyncableNodeStructure, BodyableNodeStructure, DecoratableNodeStructure, GeneratorableNodeStructure,
    JSDocableNodeStructure, PropertyNamedNodeStructure, ScopedNodeStructure, SignaturedDeclarationStructure, StaticableNodeStructure,
    TypeParameteredNodeStructure, QuestionTokenableNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { FunctionLikeDeclarationStructure } from "../function";

export interface MethodDeclarationStructure
    extends MethodDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure,
        AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure, BodyableNodeStructure,
        QuestionTokenableNodeStructure
{
}

export interface MethodDeclarationSpecificStructure extends Structure<StructureKind.Method> {
    overloads?: MethodDeclarationOverloadStructure[];
}

export interface MethodDeclarationOverloadStructure
    extends StaticableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
        QuestionTokenableNodeStructure
{
}
