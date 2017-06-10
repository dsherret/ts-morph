import {DocumentationableStructure} from "./../base";
import {StatementedStructure} from "./../statement";
import {SignaturedDeclarationStructure} from "./SignaturedDeclarationStructure";

export interface FunctionLikeDeclarationStructure extends SignaturedDeclarationStructure, DocumentationableStructure, StatementedStructure {
}
