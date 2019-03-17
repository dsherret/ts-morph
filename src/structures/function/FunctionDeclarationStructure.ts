import { AmbientableNodeStructure, AsyncableNodeStructure, ExportableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure,
    NameableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { StatementedNodeStructure } from "../statement";
import { FunctionLikeDeclarationStructure } from "./FunctionLikeDeclarationStructure";

export interface FunctionDeclarationStructure
    extends Structure, FunctionDeclarationSpecificStructure, NameableNodeStructure, FunctionLikeDeclarationStructure, StatementedNodeStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface FunctionDeclarationSpecificStructure extends KindedStructure<StructureKind.Function> {
    overloads?: FunctionDeclarationOverloadStructure[];
}

export interface FunctionDeclarationOverloadStructure
    extends Structure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure,
        AmbientableNodeStructure, ExportableNodeStructure
{
}
