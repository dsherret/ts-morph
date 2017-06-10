import {NamedStructure, TypedStructure} from "./../base";

export interface ParameterDeclarationStructure extends NamedStructure, TypedStructure {
    isRestParameter?: boolean;
}
