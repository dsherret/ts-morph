import { JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";

export interface MethodSignatureStructure
    extends PropertyNamedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure
{
}
