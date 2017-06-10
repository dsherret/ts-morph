import {NamedStructure} from "./../base";
import {PropertySignatureStructure} from "./PropertySignatureStructure";
import {MethodSignatureStructure} from "./MethodSignatureStructure";

export interface InterfaceDeclarationStructure extends NamedStructure, InterfaceDeclarationSpecificStructure {
}

export interface InterfaceDeclarationSpecificStructure {
    properties?: PropertySignatureStructure[];
    methods?: MethodSignatureStructure[];
}
