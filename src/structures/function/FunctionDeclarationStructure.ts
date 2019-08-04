import { AmbientableNodeStructure, AsyncableNodeStructure, ExportableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure, NameableNodeStructure,
    SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { FunctionLikeDeclarationStructure } from "./FunctionLikeDeclarationStructure";

export interface FunctionDeclarationStructure
    extends Structure, FunctionDeclarationSpecificStructure, NameableNodeStructure, FunctionLikeDeclarationStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface FunctionDeclarationSpecificStructure extends KindedStructure<StructureKind.Function> {
    overloads?: OptionalKind<FunctionDeclarationOverloadStructure>[];
}

export interface FunctionDeclarationOverloadStructure
    extends Structure, FunctionDeclarationOverloadSpecificStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
        AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface FunctionDeclarationOverloadSpecificStructure extends KindedStructure<StructureKind.FunctionOverload> {
}
