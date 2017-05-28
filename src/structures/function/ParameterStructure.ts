import {NamedStructure, TypedStructure} from "./../base";

export interface ParameterStructure extends NamedStructure, TypedStructure {
    isRestParameter?: boolean;
}
