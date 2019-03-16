import { JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ConstructSignatureDeclarationStructure
    extends Structure<StructureKind.ConstructSignature>, ConstructSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignaturedDeclarationStructure,
        TypeParameteredNodeStructure
{
}

export interface ConstructSignatureDeclarationSpecificStructure {
}
