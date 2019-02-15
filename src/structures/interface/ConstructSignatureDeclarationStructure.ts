import { JSDocableNodeStructure, SignatureDeclarationStructure, TypeParameteredNodeStructure } from "../base";

export interface ConstructSignatureDeclarationStructure
    extends ConstructSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignatureDeclarationStructure, TypeParameteredNodeStructure
{
}

export interface ConstructSignatureDeclarationSpecificStructure {
}
