import { JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, SignaturedDeclarationStructure,
    TypeParameteredNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface MethodSignatureStructure
    extends PropertyNamedNodeStructure, MethodSignatureSpecificStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure,
        TypeParameteredNodeStructure
{
}

export interface MethodSignatureSpecificStructure extends Structure<StructureKind.MethodSignature> {
}
