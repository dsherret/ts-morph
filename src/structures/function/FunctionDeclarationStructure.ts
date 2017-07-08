import {NamedStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure,
    DocumentationableNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure} from "./FunctionLikeDeclarationStructure";
import {SignaturedDeclarationStructure} from "./SignaturedDeclarationStructure";
import {StatementedNodeStructure} from "./../statement";

export interface FunctionDeclarationStructure
    extends NamedStructure, FunctionLikeDeclarationStructure, StatementedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure,
        ExportableNodeStructure
{
}

export interface FunctionDeclarationOverloadStructure
    extends SignaturedDeclarationStructure, DocumentationableNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure,
        ExportableNodeStructure
{
}
