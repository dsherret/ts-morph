import { JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface CallSignatureDeclarationStructure
    extends CallSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignaturedDeclarationStructure,
        TypeParameteredNodeStructure
{
}

export interface CallSignatureDeclarationSpecificStructure extends Structure<StructureKind.CallSignature> {
}
