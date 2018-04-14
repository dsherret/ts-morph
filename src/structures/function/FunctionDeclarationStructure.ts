import { NamedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure,
    JSDocableNodeStructure, BodyableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { FunctionLikeDeclarationStructure } from "./FunctionLikeDeclarationStructure";
import { StatementedNodeStructure } from "../statement";

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
