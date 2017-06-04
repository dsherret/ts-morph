import {NamedStructure} from "./../base";
import {PropertyStructure} from "./PropertyStructure";
import {MethodStructure} from "./MethodStructure";
import {ConstructorStructure} from "./ConstructorStructure";

// todo: implement this
export interface ClassStructure extends NamedStructure, ClassSpecificStructure {
}

export interface ClassSpecificStructure {
    ctor?: ConstructorStructure;
    properties?: PropertyStructure[];
    methods?: MethodStructure[];
}
