import { JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, SignatureDeclarationStructure,
    TypeParameteredNodeStructure } from "../base";

export interface MethodSignatureStructure
    extends PropertyNamedNodeStructure, MethodSignatureSpecificStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure,
        SignatureDeclarationStructure, TypeParameteredNodeStructure
{
}

export interface MethodSignatureSpecificStructure {
}
