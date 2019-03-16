import { AmbientableNodeStructure, AsyncableNodeStructure, BodyableNodeStructure, ExportableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure,
    NameableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { StatementedNodeStructure } from "../statement";
import { FunctionLikeDeclarationStructure } from "./FunctionLikeDeclarationStructure";

export interface FunctionDeclarationStructure
    extends FunctionDeclarationSpecificStructure, NameableNodeStructure, FunctionLikeDeclarationStructure, StatementedNodeStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, BodyableNodeStructure
{
}

export interface FunctionDeclarationSpecificStructure extends Structure<StructureKind.Function> {
    overloads?: FunctionDeclarationOverloadStructure[];
}

export interface FunctionDeclarationOverloadStructure
    extends SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure,
        AmbientableNodeStructure, ExportableNodeStructure
{
}
