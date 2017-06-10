import {DocumentationableNodeStructure} from "./../base";
import {StatementedNodeStructure} from "./../statement";
import {SignaturedDeclarationStructure} from "./SignaturedDeclarationStructure";

export interface FunctionLikeDeclarationStructure extends SignaturedDeclarationStructure, DocumentationableNodeStructure, StatementedNodeStructure {
}
