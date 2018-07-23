import {
    JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, SignaturedDeclarationStructure,
    TypeParameteredNodeStructure
} from "../base";

export interface MethodSignatureStructure extends PropertyNamedNodeStructure, MethodSignatureSpecificStructure,
    QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}
export interface MethodSignatureSpecificStructure {
}
