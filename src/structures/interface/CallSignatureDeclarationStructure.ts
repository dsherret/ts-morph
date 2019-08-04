import { JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface CallSignatureDeclarationStructure
    extends Structure, CallSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure
{
}

export interface CallSignatureDeclarationSpecificStructure extends KindedStructure<StructureKind.CallSignature> {
}
