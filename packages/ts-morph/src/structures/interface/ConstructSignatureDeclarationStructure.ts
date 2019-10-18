import { JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ConstructSignatureDeclarationStructure
    extends Structure, ConstructSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure
{
}

export interface ConstructSignatureDeclarationSpecificStructure extends KindedStructure<StructureKind.ConstructSignature> {
}
