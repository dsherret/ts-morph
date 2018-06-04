import { AmbientableNodeStructure, AsyncableNodeStructure, BodyableNodeStructure, ExportableNodeStructure, GeneratorableNodeStructure, JSDocableNodeStructure,
    NamedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { FunctionLikeDeclarationStructure } from "./FunctionLikeDeclarationStructure";

export interface FunctionDeclarationStructure
    extends FunctionDeclarationSpecificStructure, NamedNodeStructure, FunctionLikeDeclarationStructure, StatementedNodeStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, BodyableNodeStructure
{
}

export interface FunctionDeclarationSpecificStructure {
    overloads?: FunctionDeclarationOverloadStructure[];
}

export interface FunctionDeclarationOverloadStructure
    extends SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure,
        AmbientableNodeStructure, ExportableNodeStructure
{
}
