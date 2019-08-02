import { CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure, MethodSignatureStructure,
    PropertySignatureStructure } from "../interface";
import { OptionalKind } from "../types";

export interface TypeElementMemberedNodeStructure {
    callSignatures?: OptionalKind<CallSignatureDeclarationStructure>[];
    constructSignatures?: OptionalKind<ConstructSignatureDeclarationStructure>[];
    indexSignatures?: OptionalKind<IndexSignatureDeclarationStructure>[];
    methods?: OptionalKind<MethodSignatureStructure>[];
    properties?: OptionalKind<PropertySignatureStructure>[];
}
