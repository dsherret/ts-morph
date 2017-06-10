import {NamedStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure} from "./FunctionLikeDeclarationStructure";
import {StatementedNodeStructure} from "./../statement";

export interface FunctionDeclarationStructure
    extends NamedStructure, FunctionLikeDeclarationStructure, StatementedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure,
        ExportableNodeStructure
{
}
