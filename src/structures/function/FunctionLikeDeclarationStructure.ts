import { JSDocableNodeStructure, SignatureDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";

export interface FunctionLikeDeclarationStructure extends SignatureDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
    StatementedNodeStructure {
}
