import {PropertySignatureStructure, MethodSignatureStructure, ConstructSignatureDeclarationStructure, CallSignatureDeclarationStructure,
    IndexSignatureDeclarationStructure} from "../interface";

export interface TypeElementMemberedNodeStructure {
    callSignatures?: CallSignatureDeclarationStructure[];
    constructSignatures?: ConstructSignatureDeclarationStructure[];
    indexSignatures?: IndexSignatureDeclarationStructure[];
    methods?: MethodSignatureStructure[];
    properties?: PropertySignatureStructure[];
}
