import {NamedStructure} from "./../base";
import {PropertySignatureStructure} from "./PropertySignatureStructure";
import {MethodSignatureStructure} from "./MethodSignatureStructure";

// todo: implement this
export interface InterfaceStructure extends NamedStructure, InterfaceSpecificStructure {
}

export interface InterfaceSpecificStructure {
    properties?: PropertySignatureStructure[];
    methods?: MethodSignatureStructure[];
}
