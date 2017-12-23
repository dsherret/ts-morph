import {JSDocableNodeStructure} from "./../base";
import {StatementedNodeStructure} from "./../statement";
import {SignaturedDeclarationStructure} from "./SignaturedDeclarationStructure";

export interface FunctionLikeDeclarationStructure extends SignaturedDeclarationStructure, JSDocableNodeStructure, StatementedNodeStructure {
}
