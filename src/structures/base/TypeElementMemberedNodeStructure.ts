import { CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure, MethodSignatureStructure,
    PropertySignatureStructure } from "../interface";

export interface TypeElementMemberedNodeStructure {
    callSignatures?: CallSignatureDeclarationStructure[];
    constructSignatures?: ConstructSignatureDeclarationStructure[];
    indexSignatures?: IndexSignatureDeclarationStructure[];
    methods?: MethodSignatureStructure[];
    properties?: PropertySignatureStructure[];
}
