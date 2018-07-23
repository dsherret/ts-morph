import { JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";

export interface ConstructSignatureDeclarationStructure extends ConstructSignatureDeclarationSpecificStructure, JSDocableNodeStructure,
  SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}

export interface ConstructSignatureDeclarationSpecificStructure {
}
