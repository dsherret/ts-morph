import { JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";

export interface CallSignatureDeclarationStructure extends CallSignatureDeclarationSpecificStructure, JSDocableNodeStructure,
  SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}

export interface CallSignatureDeclarationSpecificStructure {
}
