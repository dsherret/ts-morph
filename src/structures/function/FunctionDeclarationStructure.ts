import {NamedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure,
    DocumentationableNodeStructure, BodyableNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure} from "./FunctionLikeDeclarationStructure";
import {SignaturedDeclarationStructure} from "./SignaturedDeclarationStructure";
import {StatementedNodeStructure} from "./../statement";

export interface FunctionDeclarationStructure
    extends FunctionDeclarationSpecificStructure, NamedNodeStructure, FunctionLikeDeclarationStructure, StatementedNodeStructure, AsyncableNodeStructure,
        GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, BodyableNodeStructure
{
}

export interface FunctionDeclarationSpecificStructure {
    overloads?: FunctionDeclarationOverloadStructure[];
}

export interface FunctionDeclarationOverloadStructure
    extends SignaturedDeclarationStructure, DocumentationableNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure,
        ExportableNodeStructure
{
}
