import { JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";

export interface FunctionLikeDeclarationStructure
    extends SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, StatementedNodeStructure
{
}
