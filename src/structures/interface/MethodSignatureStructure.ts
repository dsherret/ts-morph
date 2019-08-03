import { JSDocableNodeStructure, PropertyNamedNodeStructure, QuestionTokenableNodeStructure, SignaturedDeclarationStructure,
    TypeParameteredNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface MethodSignatureStructure
    extends Structure, PropertyNamedNodeStructure, MethodSignatureSpecificStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure,
        SignaturedDeclarationStructure, TypeParameteredNodeStructure
{
}

export interface MethodSignatureSpecificStructure extends KindedStructure<StructureKind.MethodSignature> {
}
