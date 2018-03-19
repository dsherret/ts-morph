import {PropertyNamedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure,
    TypeParameteredNodeStructure} from "../base";

export interface MethodSignatureStructure
    extends PropertyNamedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure
{
}
