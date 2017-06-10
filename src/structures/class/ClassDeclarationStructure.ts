import {NamedStructure} from "./../base";
import {PropertyDeclarationStructure} from "./PropertyDeclarationStructure";
import {MethodDeclarationStructure} from "./MethodDeclarationStructure";
import {ConstructorDeclarationStructure} from "./ConstructorDeclarationStructure";

// todo: implement this
export interface ClassDeclarationStructure extends NamedStructure, ClassDeclarationSpecificStructure {
}

export interface ClassDeclarationSpecificStructure {
    extends?: string;
    ctor?: ConstructorDeclarationStructure;
    properties?: PropertyDeclarationStructure[];
    methods?: MethodDeclarationStructure[];
}
