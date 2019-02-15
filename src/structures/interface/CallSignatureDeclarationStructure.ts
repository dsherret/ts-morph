import { JSDocableNodeStructure, SignatureDeclarationStructure, TypeParameteredNodeStructure } from "../base";

export interface CallSignatureDeclarationStructure
    extends CallSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignatureDeclarationStructure, TypeParameteredNodeStructure
{
}

export interface CallSignatureDeclarationSpecificStructure {
}
