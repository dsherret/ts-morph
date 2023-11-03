import {
  CallSignatureDeclarationStructure,
  ConstructSignatureDeclarationStructure,
  GetAccessorSignatureStructure,
  IndexSignatureDeclarationStructure,
  MethodSignatureStructure,
  PropertySignatureStructure,
  SetAccessorSignatureStructure,
} from "../interface";
import { OptionalKind } from "../types";

export interface TypeElementMemberedNodeStructure {
  callSignatures?: OptionalKind<CallSignatureDeclarationStructure>[];
  constructSignatures?: OptionalKind<ConstructSignatureDeclarationStructure>[];
  getterSignatures?: OptionalKind<GetAccessorSignatureStructure>[];
  indexSignatures?: OptionalKind<IndexSignatureDeclarationStructure>[];
  methods?: OptionalKind<MethodSignatureStructure>[];
  properties?: OptionalKind<PropertySignatureStructure>[];
  setterSignatures?: OptionalKind<SetAccessorSignatureStructure>[];
}
